# Platform Adapters

Production-proven scraping adapters for Dutch freelance platforms, ported from TSG app.

## Quick Start

```typescript
import { createAdapters } from '@/adapters';

const adapters = createAdapters();

for (const adapter of adapters) {
  const listings = await adapter.fetchListings();
  console.log(`${adapter.displayName}: ${listings.length} listings`);
}
```

## Platforms

- **Striive** - HeadFirst Group (~150 listings)
- **Opdrachtoverheid** - Government tenders (~51,000+ listings)
- **Flextender** - Tender system (~20 listings)

## Files

- `types.ts` - Core interfaces (`Listing`, `PlatformAdapter`)
- `striive.ts` - Striive adapter (REST API)
- `opdrachtoverheid.ts` - Opdrachtoverheid adapter (POST API)
- `flextender.ts` - Flextender adapter (WordPress AJAX + Cheerio)
- `index.ts` - Factory function and exports

## Documentation

See `/docs/ADAPTERS.md` for full documentation.

## Testing

```bash
bun scripts/test-adapters.ts
```
