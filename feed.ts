export type FeedType = "bbc" | "motorsport" | "motor1";

export type Feed = {
  name: string;
  url: string;
  type: FeedType;
  newsCount?: number;
};

export const RSS_FEEDS: Feed[] = [
  {
    name: "bbc-world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    type: "bbc",
  },
  {
    name: "motor1",
    url: "https://www.motor1.com/rss/features/all/",
    type: "motor1",
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
