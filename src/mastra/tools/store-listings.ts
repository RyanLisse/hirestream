import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool: Store Listings
 *
 * Stores scraped job listings in the database (Convex).
 * Handles deduplication and updates existing listings.
 *
 * Integration Note:
 * This is a placeholder. Replace with actual Convex mutations:
 * - Use Convex client to insert/update listings
 * - Implement deduplication logic (check by platform + external ID)
 * - Track creation/update timestamps
 */

const listingSchema = z.object({
  id: z.string(),
  platform: z.string(),
  title: z.string(),
  description: z.string(),
  rate: z.number().optional(),
  province: z.string().optional(),
  contractType: z.string().optional(),
  hoursPerWeek: z.number().optional(),
  url: z.string().url(),
  postedDate: z.string().optional(),
});

export const storeListingsTool = createTool({
  id: 'store-listings',
  description: 'Store job listings in the database with deduplication',
  inputSchema: z.object({
    listings: z.array(listingSchema)
      .describe('Array of job listings to store'),
  }),
  execute: async ({ context }) => {
    const { listings } = context;

    // TODO: Replace with actual Convex integration
    // Example:
    // const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    // for (const listing of listings) {
    //   await convex.mutation(api.jobs.upsertListing, listing);
    // }

    const stored: string[] = [];
    const skipped: string[] = [];

    // Mock storage logic
    for (const listing of listings) {
      // Simulate deduplication check
      const isDuplicate = Math.random() > 0.7; // 30% chance of duplicate

      if (isDuplicate) {
        skipped.push(listing.id);
      } else {
        stored.push(listing.id);
      }
    }

    return {
      totalReceived: listings.length,
      stored: stored.length,
      skipped: skipped.length,
      storedIds: stored,
      skippedIds: skipped,
      message: `Stored ${stored.length} new listings, skipped ${skipped.length} duplicates. (MOCK - integrate Convex)`,
    };
  },
});
