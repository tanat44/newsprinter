import type { FeedType } from "./feed.ts";

export type IgnoreType = {
  [key in FeedType]: string[];
};

export const IGNORES: IgnoreType = {
  bbc: [
    "div[class^='Byline-styles__ActionsContainerStyled']",
    "div[data-testid='links-grid']",
    "figure[data-travelling-actions-obscures='true']",
    "a[href^='https://www.bbc.co.uk/newsletters']",
  ],
  motorsport: [
    ".msnt-breadcrumbs",
    ".msnt-author-toolbar",
    "msnt-comments-promo",
    "msnt-survey-promo",
    ".ms-apb",
    "msnt-share",
    "section[.relatedContent]",
    ".ms-article-end",
    ".ms-comments-wrapper",
    ".msnt-article-prev-next",
  ],
};
