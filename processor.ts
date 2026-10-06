import type { FeedType } from "./feed.ts";

type ProcessorSpec = {
  removeElements: string[];
  removeAfterElement?: string;
};

export type Processor = {
  [key in FeedType]: ProcessorSpec;
};

export const PROCESSORS: Processor = {
  bbc: {
    removeElements: [
      "div[class^='Byline-styles__ActionsContainerStyled']",
      "div[data-testid='links-grid']",
      "div[data-block='media']",
      "div[data-block='links']",
      "div[data-block='topicList']",
      "div[data-block='promoList']",
      "figure[data-travelling-actions-obscures='true']",
      "a[href^='https://www.bbc.co.uk/newsletters']",
    ],
  },
  motorsport: {
    removeElements: [
      ".msnt-breadcrumbs",
      ".msnt-author-toolbar",
      "msnt-comments-promo",
      "msnt-survey-promo",
      ".ms-apb",
      "msnt-share",
      "section.relatedContent",
      ".ms-article-end",
      ".ms-comments-wrapper",
      ".msnt-article-prev-next",
    ],
  },
  motor1: {
    removeElements: [
      "div[slot='breadcrumbs']",
      "iframe",
      ".m1-survey-promo",
      ".m1-basic-wrapper-grid-meta",
      "section.infobox",
      "div.apInarticleSmallRes",
      "section.relatedContent-new",
      "aside",
      "div[data-widget='recommendations-strip']",
    ],
    removeAfterElement: "div.comments-hider",
  },
};
