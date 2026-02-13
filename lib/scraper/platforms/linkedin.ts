import { ScrapeConfig } from "../index"

export function getLinkedInConfig(searchQuery: string): ScrapeConfig {
  return {
    platform: "LinkedIn",
    baseUrl: "https://www.linkedin.com/jobs/search",
    searchQuery,
    selectors: {
      jobList: "div.base-search-card",
      title: "h3.base-search-card__title",
      company: "h4.base-search-card__subtitle",
      location: "span.job-search-card__location",
      description: "p.base-search-card__snippet",
      link: "a.base-card__full-link",
    },
  }
}
