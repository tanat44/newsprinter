export type FeedType = "bbc" | "motorsport";

export type Feed = {
  name: string;
  url: string;
  type: FeedType;
};

export const RSS_FEEDS: Feed[] = [
  {
    name: "bbc-main",
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    type: "bbc",
  },
  {
    name: "motorsport-f1",
    url: "https://www.motorsport.com/rss/f1/news/",
    type: "motorsport",
  },
  {
    name: "motorsport-wec",
    url: "https://www.motorsport.com/rss/wec/news/",
    type: "motorsport",
  },
];
