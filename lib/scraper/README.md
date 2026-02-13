# Job Scraper Library

Professional job scraping framework with deduplication and platform adapters.

## Quick Start

```typescript
import { scrapeJobs } from "@/lib/scraper"
import { getIndeedConfig } from "@/lib/scraper/platforms"

// Scrape Indeed for jobs
const jobs = await scrapeJobs(getIndeedConfig("React Developer"))
```

## Core Exports

### Main Module (`index.ts`)
- `scrapeJobs(config)` - Main scraping function
- `ScrapedJob` interface - Job data structure
- `ScrapeConfig` interface - Configuration structure
- Utility functions: `inferJobType()`, `extractRequirements()`, `extractSalary()`

### Deduplication (`dedup.ts`)
- `createDeduplicationStore()` - Create a new store
- `filterDuplicates()` - Remove duplicate jobs
- `generateJobHash()` - Create unique job hash
- `isDuplicateJob()` - Check for duplicates

### Platform Adapters (`platforms/`)
- `getIndeedConfig()` - Indeed.com adapter
- `getLinkedInConfig()` - LinkedIn adapter
- `getGovernmentJobsConfig()` - Werkvoornederland adapter
- `getGenericConfig()` - Custom website adapter

## Features

- Lightweight Cheerio-based parsing
- No headless browser required
- SHA256 deduplication
- Pre-configured adapters for 4 job boards
- Generic adapter for custom websites
- Comprehensive error handling
- Type-safe TypeScript interfaces

## Documentation

- [SCRAPER_GUIDE.md](/docs/SCRAPER_GUIDE.md) - Complete API reference
- [QUICK_START.md](/docs/QUICK_START.md) - Integration examples
- [IMPLEMENTATION_SUMMARY.md](/docs/IMPLEMENTATION_SUMMARY.md) - Architecture

## Installation

```bash
npm install cheerio
```

## Examples

### Single Platform
```typescript
import { scrapeJobs } from "@/lib/scraper"
import { getLinkedInConfig } from "@/lib/scraper/platforms"

const jobs = await scrapeJobs(getLinkedInConfig("Product Manager"))
```

### Multiple Platforms
```typescript
import { scrapeJobs } from "@/lib/scraper"
import {
  getIndeedConfig,
  getLinkedInConfig,
  getGovernmentJobsConfig,
} from "@/lib/scraper/platforms"
import { createDeduplicationStore, filterDuplicates } from "@/lib/scraper/dedup"

const store = createDeduplicationStore()
const allJobs = []

for (const config of [
  getIndeedConfig("Engineer"),
  getLinkedInConfig("Engineer"),
  getGovernmentJobsConfig("Engineer"),
]) {
  const jobs = await scrapeJobs(config)
  allJobs.push(...filterDuplicates(jobs, store))
}
```

### Custom Website
```typescript
import { scrapeJobs } from "@/lib/scraper"
import { getGenericConfig } from "@/lib/scraper/platforms"

const config = getGenericConfig({
  platform: "MyJobBoard",
  baseUrl: "https://myjobboard.com/jobs",
  searchQuery: "Engineer",
  selectors: {
    jobList: "div.job-card",
    title: "h2.job-title",
    company: "span.company",
    location: "span.location",
    description: "p.description",
    link: "a.apply",
  },
})

const jobs = await scrapeJobs(config)
```

## File Structure

```
lib/scraper/
├── index.ts              # Main framework
├── dedup.ts              # Deduplication
├── README.md             # This file
└── platforms/
    ├── index.ts          # Exports
    ├── indeed.ts         # Indeed adapter
    ├── linkedin.ts       # LinkedIn adapter
    ├── government.ts     # Government adapter
    └── generic.ts        # Generic adapter
```

## Support

See documentation in `/docs/` directory for:
- Complete API reference
- Integration patterns
- Best practices
- Troubleshooting
- Database examples
- API route examples
