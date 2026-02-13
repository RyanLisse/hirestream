import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool: Search Listings
 *
 * Search stored job listings by keywords, platform, location, and rate range.
 *
 * Integration Note:
 * Replace with actual Convex query:
 * - Use Convex client to query stored listings
 * - Implement full-text search or keyword matching
 * - Filter by platform, province, rate range
 * - Sort by relevance or date
 */

export const searchListingsTool = createTool({
  id: 'search-listings',
  description: 'Search stored job listings by keywords, platform, province, or rate range',
  inputSchema: z.object({
    keywords: z.string().optional()
      .describe('Search keywords (e.g., "React developer", "backend engineer")'),
    platform: z.enum(['striive', 'opdrachtoverheid', 'flextender', 'all']).optional()
      .describe('Filter by platform'),
    province: z.string().optional()
      .describe('Filter by Dutch province (e.g., "Noord-Holland", "Utrecht")'),
    minRate: z.number().optional()
      .describe('Minimum hourly rate in EUR'),
    maxRate: z.number().optional()
      .describe('Maximum hourly rate in EUR'),
    limit: z.number().default(20)
      .describe('Maximum number of results to return'),
  }),
  execute: async ({ context }) => {
    const { keywords, platform, province, minRate, maxRate, limit } = context;

    // TODO: Replace with actual Convex query
    // Example:
    // const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    // const results = await convex.query(api.jobs.searchListings, {
    //   keywords, platform, province, minRate, maxRate, limit
    // });

    // Mock search results
    const mockResults = generateMockSearchResults({
      keywords,
      platform,
      province,
      minRate,
      maxRate,
      limit,
    });

    return {
      query: { keywords, platform, province, minRate, maxRate },
      resultsFound: mockResults.length,
      results: mockResults,
      message: `Found ${mockResults.length} matching listings. (MOCK DATA - integrate Convex search)`,
    };
  },
});

/**
 * Mock search results generator
 * Replace entirely with Convex query
 */
function generateMockSearchResults(params: {
  keywords?: string;
  platform?: string;
  province?: string;
  minRate?: number;
  maxRate?: number;
  limit: number;
}) {
  const { limit, platform, province, minRate, maxRate } = params;

  const results = [];
  const count = Math.min(limit, 5);

  for (let i = 0; i < count; i++) {
    const rate = (minRate || 80) + i * 10;

    // Only include if within rate range
    if (maxRate && rate > maxRate) continue;

    results.push({
      id: `listing-${i}`,
      platform: platform === 'all' || !platform ? 'striive' : platform,
      title: `Senior Developer ${i + 1}`,
      description: 'Full-stack development role',
      rate,
      province: province || 'Noord-Holland',
      contractType: 'ZZP',
      hoursPerWeek: 36,
      url: `https://example.com/job/${i}`,
      postedDate: new Date(Date.now() - i * 86400000).toISOString(),
      matchScore: 0.85 - i * 0.1,
    });
  }

  return results;
}
