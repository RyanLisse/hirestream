import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  createAdapters,
  type Listing,
} from '../../adapters';

/**
 * Tool: Scrape Platform
 *
 * Scrapes Dutch freelance job platforms for listings using production-proven adapters.
 *
 * Supported platforms:
 * - striive: HeadFirst Group platform (~150 listings)
 * - opdrachtoverheid: Dutch government tenders (~51,000 listings)
 * - flextender: Government assignments via tender system (~20 listings)
 * - all: Scrape all platforms
 */

export const scrapePlatformTool = createTool({
  id: 'scrape-platform',
  description: 'Scrape job listings from Dutch freelance platforms (Striive, Opdrachtoverheid, Flextender, or all)',
  inputSchema: z.object({
    platform: z.enum(['striive', 'opdrachtoverheid', 'flextender', 'all'])
      .describe('Which platform to scrape. Use "all" to scrape all platforms.'),
    maxListings: z.number().optional()
      .describe('Maximum number of listings to fetch (optional, defaults vary by platform)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    platform: z.string(),
    listingsFound: z.number(),
    listings: z.array(z.object({
      externalId: z.string(),
      title: z.string(),
      organization: z.string().optional(),
      location: z.string().optional(),
      rateMax: z.number().optional(),
      hoursPerWeek: z.number().optional(),
      sourceUrl: z.string().optional(),
      platform: z.string(),
    })),
    error: z.string().optional(),
  }),
  execute: async ({ context }: any) => {
    const { platform, maxListings } = context as { platform: 'striive' | 'opdrachtoverheid' | 'flextender' | 'all'; maxListings?: number };

    try {
      // Create adapters with optional Firecrawl API key from environment
      const adapters = createAdapters({
        firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
        flextenderDetailLimit: maxListings,
      });

      let results: Listing[] = [];

      if (platform === 'all') {
        // Run all adapters
        for (const adapter of adapters) {
          if (!adapter.enabled) continue;
          try {
            console.log(`Scraping ${adapter.displayName}...`);
            const listings = await adapter.fetchListings();
            results = results.concat(listings);
            console.log(`✓ ${adapter.displayName}: ${listings.length} listings`);
          } catch (error) {
            console.error(`✗ ${adapter.displayName} failed:`, error);
          }
        }
      } else {
        // Run specific adapter
        const adapter = adapters.find(a => a.name === platform);
        if (!adapter) {
          return {
            success: false,
            platform,
            listingsFound: 0,
            listings: [],
            error: `Unknown platform: ${platform}`,
          };
        }

        if (!adapter.enabled) {
          return {
            success: false,
            platform,
            listingsFound: 0,
            listings: [],
            error: `Platform ${platform} is disabled`,
          };
        }

        console.log(`Scraping ${adapter.displayName}...`);
        results = await adapter.fetchListings();
        console.log(`✓ ${adapter.displayName}: ${results.length} listings`);
      }

      // Transform to simplified format for output
      const simplifiedListings = results.map(l => ({
        externalId: l.externalId,
        title: l.title,
        organization: l.organization,
        location: l.location,
        rateMax: l.rateMax,
        hoursPerWeek: l.hoursPerWeek,
        sourceUrl: l.sourceUrl,
        platform: l.platform,
      }));

      return {
        success: true,
        platform,
        listingsFound: results.length,
        listings: simplifiedListings,
      };
    } catch (error) {
      return {
        success: false,
        platform,
        listingsFound: 0,
        listings: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
