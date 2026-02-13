import { Agent } from '@mastra/core/agent';
import { scrapePlatformTool } from '../tools/scrape-platform';
import { storeListingsTool } from '../tools/store-listings';

export const scraperAgent = new Agent({
  id: 'scraper-agent',
  name: 'Job Scraper',
  instructions: `
You are a background job scraper. When triggered, scrape all platforms and store results.

Steps:
1. Scrape each platform (Striive, Opdrachtoverheid, Flextender)
2. Store new listings in the database
3. Report: total found, new listings, duplicates skipped

Be efficient. Don't chat — just execute and report results.
  `,
  model: {
    provider: 'anthropic',
    name: 'claude-haiku-4-5-20251001',
    toolChoice: 'auto',
  },
  tools: {
    scrapePlatformTool,
    storeListingsTool,
  },
});
