import axios from "axios";
import { exec } from "child_process";
import { format } from "date-fns/format";
import { configDotenv } from "dotenv";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import * as htmlparser from "node-html-parser";
import path from "path";
import { chromium, type Browser } from "playwright";
import { dbHasNews, dbInsertNews, initDatabase } from "./db.ts";
import { RSS_FEEDS, type Feed } from "./feed.ts";
import { PROCESSORS } from "./processor.ts";

const SAVE_FOLDERS = "saves";
const { time, dir } = createFolder();
const env = configDotenv().parsed;
const debug = env?.DEBUG === "true";

main();

async function main() {
  if (debug) console.log("DEBUG MODE");
  initDatabase();
  for (const feed of RSS_FEEDS) {
    const filePaths = await processFeed(feed);
    for (const filePath of filePaths) {
      if (!filePath) continue;

      // printing
      // use 'lpr' command to print pdf in macos
      exec(`lpr ${filePath}`, (err, stdout, stderr) => {
        if (err) {
          console.log("cannot print", filePath);
          return;
        }
        if (stdout) console.log(`stdout: ${stdout}`);
        if (stderr) console.log(`stderr: ${stderr}`);
      });
    }
  }
}

async function processFeed(feed: Feed) {
  const urls = await readFeedTopItem(feed);

  const filePaths: string[] = [];
  for (const url of urls) {
    console.log(feed.name, url);
    if (dbHasNews(url) && !debug) {
      console.log("\tskip: found news in db");
      continue;
    }
    const filePath = await generatePdf(url, dir, feed);
    const _success = dbInsertNews(time.getTime(), url, filePath);
    filePaths.push(filePath);
  }

  return filePaths;
}

async function readFeedTopItem(feed: Feed): Promise<string[]> {
  const res = await axios.get(feed.url);
  const parser = new XMLParser();
  const feedSpec = parser.parse(res.data);
  const news = feedSpec.rss.channel.item;
  if (!feed.newsCount) return [news[0].link];

  const urls = [];
  for (let i = 0; i < news.length && i < feed.newsCount; ++i) {
    urls.push(news[i].link);
  }
  return urls;
}

function createFolder() {
  const now = new Date();
  const nowString = format(now, "yyMMdd-HHmm");
  const dir = path.join(SAVE_FOLDERS, nowString);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return { time: now, dir };
}

async function generatePdf(url: string, dir: string, feed: Feed) {
  let browser: Browser | undefined;
  const outputPath = path.join(dir, `${feed.name}.pdf`);

  try {
    browser = await chromium.launch({ headless: false });

    const page = await browser.newPage();
    console.log("\tloading page");
    await page.goto(url, {
      timeout: 10000,
      waitUntil: "commit",
    });

    // process content
    const content = await page.getByRole("article").innerHTML();
    const dom = htmlparser.parse(content);

    // remove doms
    const processor = PROCESSORS[feed.type];
    for (const ignore of processor.removeElements) {
      const targets = dom.querySelectorAll(ignore);
      targets.forEach((target) => target.remove());
    }

    // remove after dom
    if (processor.removeAfterElement) {
      const from = dom.querySelector(processor.removeAfterElement);
      const parent = from?.parentNode;
      if (parent) {
        const index = parent.children.findIndex((x) => x === from);
        if (index > -1) {
          const toRemove = [];
          for (let i = index; i < parent.children.length; ++i)
            toRemove.push(parent.children.at(i));
          for (const dom of toRemove) dom?.remove();
        }
      }
    }

    // resize images
    const images = dom.querySelectorAll("img");
    for (const img of images) {
      img.removeAttribute("width");
      img.removeAttribute("height");
      img.setAttribute("style", "object-fit: contain; width: 300px;");
    }

    await page.setContent(dom.toString());
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: false,
      headerTemplate: `<span style="font-size: 30px"><a href="${url}">link</a></span>`,
      displayHeaderFooter: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log(`pdf created: ${outputPath}`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  } finally {
    if (browser && !debug) {
      await browser?.close();
    }
  }
  return outputPath;
}
