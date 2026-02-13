/**
 * Simple test script to verify adapters work correctly
 * Run with: bun scripts/test-adapters.ts
 */

import { createAdapters } from '../src/adapters';

async function main() {
  console.log('🧪 Testing Platform Adapters\n');

  const adapters = createAdapters({
    // No Firecrawl API key - will use fallback HTML parsing
    flextenderDetailLimit: 3, // Limit for testing
  });

  console.log(`Found ${adapters.length} adapters:\n`);

  for (const adapter of adapters) {
    console.log(`📋 ${adapter.displayName} (${adapter.name})`);
    console.log(`   Enabled: ${adapter.enabled}`);

    if (adapter.enabled) {
      try {
        console.log(`   Fetching listings...`);
        const startTime = Date.now();

        // For testing, we'll just fetch first page/batch
        const listings = await adapter.fetchListings();

        const duration = Date.now() - startTime;
        console.log(`   ✅ Success: ${listings.length} listings in ${duration}ms`);

        if (listings.length > 0) {
          const first = listings[0];
          console.log(`   📄 Sample: "${first.title}"`);
          console.log(`      Organization: ${first.organization || 'N/A'}`);
          console.log(`      Location: ${first.location || 'N/A'}`);
          console.log(`      Rate: €${first.rateMax || 'N/A'}/hr`);
          console.log(`      URL: ${first.sourceUrl}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    console.log('');
  }

  console.log('✅ Test complete!');
}

main().catch(console.error);
