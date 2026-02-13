/**
 * Platform Adapters - Export and Factory
 */

import type { PlatformAdapter } from './types';
import { StriiveAdapter } from './striive';
import { OpdrachtoverheidAdapter } from './opdrachtoverheid';
import { FlextenderAdapter } from './flextender';

export { PlatformAdapter, Listing, DUTCH_PROVINCES, type DutchProvince } from './types';
export { StriiveAdapter } from './striive';
export { OpdrachtoverheidAdapter } from './opdrachtoverheid';
export { FlextenderAdapter, type FlextenderAdapterOptions } from './flextender';

/**
 * Create all platform adapters with optional configuration
 */
export function createAdapters(opts?: { firecrawlApiKey?: string; flextenderDetailLimit?: number }): PlatformAdapter[] {
  return [
    new StriiveAdapter(),
    new OpdrachtoverheidAdapter(),
    new FlextenderAdapter({
      firecrawlApiKey: opts?.firecrawlApiKey,
      detailLimit: opts?.flextenderDetailLimit,
    }),
  ];
}
