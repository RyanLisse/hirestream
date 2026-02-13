import { ScrapeConfig } from "../index"

export function getIndeedConfig(searchQuery: string): ScrapeConfig {
  return {
    platform: "Indeed",
    baseUrl: "https://www.indeed.com/jobs",
    searchQuery,
    selectors: {
      jobList: "div.job-search-results div.job-card-container",
      title: "h2.jobTitle span",
      company: "span.companyName",
      location: "div.companyLocation",
      description: "div.job-snippet",
      link: "a.jcs-JobTitle",
    },
  }
}
