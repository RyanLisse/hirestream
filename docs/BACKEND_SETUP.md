# Backend Setup Guide

## Overview

This document provides setup instructions for the AI recruitment platform backend built with Next.js 16, Supabase, and TypeScript.

## Prerequisites

- Node.js 18+
- pnpm (already installed)
- Supabase account (https://supabase.com)
- Anthropic API key (for AI features)

## Quick Start

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy the contents of `lib/supabase/migration.sql`
4. Run the migration in the SQL Editor

This will create:
- All required tables (candidates, jobs, applications, interviews, messages, scrape_configs)
- Indexes for optimal query performance
- Row Level Security (RLS) policies
- Foreign key constraints

### 3. Verify Installation

Run the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:3000

## Architecture

### Directory Structure

```
lib/supabase/
  ├── client.ts          # Client-side Supabase client
  ├── server.ts          # Server-side Supabase client
  ├── types.ts           # TypeScript database types
  └── migration.sql      # Database schema

app/api/
  ├── candidates/route.ts      # Candidate CRUD operations
  ├── jobs/route.ts            # Job CRUD operations
  ├── applications/route.ts    # Application management
  └── scraper/
      ├── config/route.ts      # Scraper configuration
      └── run/route.ts         # Trigger scraping jobs

middleware.ts                  # Auth middleware
```

### Database Schema

#### Candidates Table
- Stores candidate information, resumes, and AI scoring
- Tracks status (new, screening, interview, offer, hired, rejected)
- Supports skills array and experience tracking

#### Jobs Table
- Job postings with requirements and criteria
- Supports knock-out and scoring criteria (JSONB)
- Can be manually created or scraped from platforms

#### Applications Table
- Links candidates to jobs
- Stores AI match scores and evaluation results
- Tracks application stage and status

#### Interviews Table
- Interview scheduling and feedback
- Supports multiple types (phone, video, onsite, technical)
- Rating system (1-5 stars)

#### Messages Table
- Communication tracking
- Template management
- Open rate analytics

#### Scrape Configs Table
- Platform configuration for job scraping
- Scheduling support
- Custom selectors (JSONB)

## API Routes

### Candidates API

**GET /api/candidates**
```typescript
// Query parameters
?search=john           // Search name or email
?status=screening      // Filter by status
?page=1               // Pagination
?limit=10             // Results per page

// Response
{
  data: Candidate[],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

**POST /api/candidates**
```typescript
// Request body
{
  name: string,           // Required
  email: string,          // Required
  phone?: string,
  location?: string,
  resume_url?: string,
  resume_text?: string,
  skills?: string[],
  experience_years?: number,
  education?: string,
  source?: string,
  status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
}

// Response: Created candidate object (201)
```

### Jobs API

**GET /api/jobs**
```typescript
// Query parameters
?status=active        // Filter by status
?department=eng       // Filter by department
?location=remote      // Filter by location
?page=1
?limit=10

// Response
{
  data: Job[],
  pagination: { ... }
}
```

**POST /api/jobs**
```typescript
// Request body
{
  title: string,              // Required
  department?: string,
  location?: string,
  type?: string,
  description?: string,
  requirements?: string[],
  knock_out_criteria?: Json[],
  scoring_criteria?: Json[],
  status?: 'active' | 'paused' | 'closed'
}

// Response: Created job object (201)
```

### Applications API

**GET /api/applications**
```typescript
// Query parameters
?job_id=uuid          // Filter by job
?candidate_id=uuid    // Filter by candidate
?status=pending       // Filter by status
?stage=interview      // Filter by stage
?page=1
?limit=10

// Response includes joined candidate and job data
{
  data: Application[],  // Each includes candidate{} and job{}
  pagination: { ... }
}
```

**POST /api/applications**
```typescript
// Request body
{
  candidate_id: string,      // Required
  job_id: string,           // Required
  status?: string,
  stage?: string,
  ai_match_score?: number,
  knock_out_results?: Json,
  scoring_results?: Json,
  notes?: string
}

// Response: Created application (201)
// Error: 409 if application already exists
```

**PATCH /api/applications?id=uuid**
```typescript
// Request body - all fields optional
{
  status?: string,
  stage?: string,
  ai_match_score?: number,
  knock_out_results?: Json,
  scoring_results?: Json,
  notes?: string
}

// Response: Updated application
```

### Scraper API

**GET /api/scraper/config**
```typescript
// Query parameters
?platform=linkedin    // Filter by platform
?active=true         // Filter by active status

// Response
{
  data: ScrapeConfig[]
}
```

**POST /api/scraper/config**
```typescript
// Request body
{
  platform: string,      // Required (e.g., 'linkedin', 'indeed')
  base_url: string,      // Required
  search_query?: string,
  selectors?: Json,      // CSS selectors for scraping
  schedule?: string,     // Cron expression
  active?: boolean
}

// Response: Created config (201)
```

**POST /api/scraper/run**
```typescript
// Request body
{
  config_id: string     // Required
}

// Response
{
  message: "Scrape job initiated",
  config: { ... },
  status: "queued"
}

// Note: Implement actual scraper logic in production
// Consider using job queues (BullMQ, Inngest)
```

## Authentication & Middleware

The middleware handles:

1. **Session Refresh**: Automatically refreshes Supabase sessions
2. **Protected Routes**: Redirects unauthenticated users to /login
3. **API Authentication**: Supports Bearer token auth for API routes
4. **Smart Redirects**: Prevents authenticated users from accessing /login

### Protected Routes
- /dashboard
- /candidates
- /jobs
- /applications

### API Authentication

Two methods supported:

1. **Session-based** (for browser requests):
```typescript
// Automatic via cookies
```

2. **Token-based** (for external services):
```bash
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3000/api/candidates
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that:

1. Allow full access for authenticated users
2. Allow service role full access
3. Block public access

**Production Note**: Refine RLS policies based on your specific requirements (e.g., users can only see their own applications).

## Error Handling

All API routes implement consistent error handling:

- **400**: Bad request (validation errors)
- **401**: Unauthorized (missing/invalid auth)
- **404**: Not found
- **409**: Conflict (duplicate resources)
- **500**: Internal server error

Errors return:
```typescript
{
  error: string  // Human-readable error message
}
```

## Type Safety

The `lib/supabase/types.ts` file provides full TypeScript types for:
- Database tables (Row, Insert, Update types)
- Queries with autocomplete
- Type-safe client usage

Example:
```typescript
import { Database } from '@/lib/supabase/types'

// Fully typed
const { data } = await supabase
  .from('candidates')
  .select('*')
  .eq('status', 'screening')  // Type-safe status values
```

## Next Steps

1. **Implement Authentication UI**: Add login/signup pages
2. **Add File Upload**: Implement resume upload to Supabase Storage
3. **Implement Scraper Logic**: Build actual job scraping service
4. **Add AI Features**: Integrate Anthropic API for candidate scoring
5. **Setup Job Queue**: Use BullMQ or Inngest for background jobs
6. **Monitoring**: Add error tracking (Sentry) and analytics

## Development

```bash
# Run development server
pnpm dev

# Type checking
pnpm run typecheck

# Build for production
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Database Connection Issues

If you get Supabase connection errors:
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
3. Ensure Supabase project is active

### Type Errors

If TypeScript complains about Supabase types:
```bash
# Regenerate types from your Supabase schema
npx supabase gen types typescript --project-id your-project-ref > lib/supabase/types.ts
```

### Middleware Issues

If auth redirects aren't working:
1. Check middleware.ts matcher config
2. Verify session is being set correctly
3. Check browser cookies are enabled

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review Next.js 16 docs: https://nextjs.org/docs
3. Check the AI SDK: https://sdk.vercel.ai/docs
