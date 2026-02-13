import { Mastra } from '@mastra/core';
import { recruitmentAgent } from './agents/recruitment-agent';
import { scraperAgent } from './agents/scraper-agent';

export const mastra = new Mastra({
  agents: {
    recruitmentAgent,
    scraperAgent,
  },
});
