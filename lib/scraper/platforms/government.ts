import { ScrapeConfig } from "../index"

export function getGovernmentJobsConfig(searchQuery: string): ScrapeConfig {
  return {
    platform: "Werkvoornederland",
    baseUrl: "https://werkvoornederland.nl/vacatures",
    searchQuery,
    selectors: {
      jobList: "div.job-listing-item",
      title: "h2.job-title",
      company: "div.company-name",
      location: "span.job-location",
      description: "div.job-description",
      link: "a.job-link",
    },
  }
}
