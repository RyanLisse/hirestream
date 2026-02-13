import { ScrapeConfig } from "../index"

export interface GenericScraperOptions {
  platform: string
  baseUrl: string
  searchQuery: string
  selectors: {
    jobList: string
    title: string
    company: string
    location: string
    description: string
    link: string
  }
}

export function getGenericConfig(options: GenericScraperOptions): ScrapeConfig {
  return {
    platform: options.platform,
    baseUrl: options.baseUrl,
    searchQuery: options.searchQuery,
    selectors: {
      jobList: options.selectors.jobList,
      title: options.selectors.title,
      company: options.selectors.company,
      location: options.selectors.location,
      description: options.selectors.description,
      link: options.selectors.link,
    },
  }
}
