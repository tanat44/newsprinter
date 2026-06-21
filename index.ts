import axios from "axios";
import { format } from "date-fns/format";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import * as htmlparser from "node-html-parser";
import path from "path";
import { chromium, type Browser } from "playwright";
import { RSS_FEEDS, type Feed } from "./feed.ts";
import { IGNORES } from "./ignorecontent.ts";

const SAVE_FOLDERS = "saves";
const dir = createFolder();

main();

async function main() {
  for (const feed of RSS_FEEDS) {
    await processFeed(feed);
  }
}

async function processFeed(feed: Feed) {
  const link = await readFeedTopItem(feed);
  await generatePdf(link, dir, feed);
}

async function readFeedTopItem(feed: Feed) {
  const res = await axios.get(feed.url);
  const parser = new XMLParser();
  const feedSpec = parser.parse(res.data);
  const topItem = feedSpec.rss.channel.item[0];
  return topItem.link;
}

function createFolder() {
  const nowString = format(new Date(), "yyMMdd-HHmm");
  const dir = path.join(SAVE_FOLDERS, nowString);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

async function generatePdf(url: string, dir: string, feed: Feed) {
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: false });

    const page = await browser.newPage();
    console.log("loading:", url);
    await page.goto(url, {
      timeout: 5000,
    });

    const outputPath = path.join(dir, `${feed.name}.pdf`);

    // process content
    const content = await page.getByRole("article").innerHTML();
    const dom = htmlparser.parse(content);

    // ignore doms
    const ignores = IGNORES[feed.type];
    for (const ignore of ignores) {
      const targets = dom.querySelectorAll(ignore);
      targets.forEach((target) => target.remove());
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
    if (browser) {
      // await browser.close();
    }
  }
}
