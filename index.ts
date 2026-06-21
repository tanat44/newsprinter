import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const RSS_FEED = [
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.motorsport.com/rss/f1/news/",
  "https://www.motorsport.com/rss/wec/news/",
  // "https://feeds.bbci.co.uk/news/technology/rss.xml",
  // "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
];

readFeedTopItem(RSS_FEED[0]);

async function readFeedTopItem(url: string) {
  const res = await axios.get(url);
  const parser = new XMLParser();
  const feed = parser.parse(res.data);
  const topItem = feed.rss.channel.item[0];
  console.log(topItem);
}
