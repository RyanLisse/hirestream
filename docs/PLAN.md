# Optymatch AI Recruitment Platform - Implementation Plan

## Vision
Transform the existing TalentAI dashboard into a full-stack AI recruitment platform (Optymatch-style) with multi-platform job scraping, AI resume grading, CV-vacancy matching with knock-out criteria, and ATS capabilities.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 + React 19 + shadcn/ui (existing)
- **Backend**: Next.js API routes + Server Actions
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Engine**: Claude API via Vercel AI SDK for resume grading & matching
- **Scraping**: Puppeteer/Playwright for job platform scraping workers
- **Queue**: Vercel Cron + edge functions for scheduled scraping
- **File Processing**: PDF parsing (pdf-parse), DOCX parsing

### Database Schema (Supabase)
```
candidates (id, name, email, phone, location, resume_url, resume_text, ai_score, ai_content_score, skills[], experience_years, education, source, created_at)
jobs (id, title, department, location, type, description, requirements[], knock_out_criteria[], scoring_criteria[], status, platform_source, external_url, scraped_at, created_at)
applications (id, candidate_id, job_id, status, stage, ai_match_score, knock_out_results jsonb, scoring_results jsonb, created_at)
interviews (id, application_id, type, date, interviewer, status, feedback, rating)
messages (id, application_id, template, subject, body, status, sent_at)
scrape_configs (id, platform, url, schedule, selectors jsonb, active, last_run)
scrape_results (id, config_id, jobs_found, jobs_new, errors, run_at)
```

### Core Features to Build

#### 1. Multi-Platform Job Scraper (Priority: HIGH)
- Configurable scraper for Indeed, LinkedIn, Glassdoor, government job boards
- Admin UI to add/manage scrape targets with CSS selectors
- Scheduled runs via Cron (hourly/daily)
- Deduplication by title+company+location hash
- Results feed into jobs table automatically

#### 2. AI Resume Grading Engine (Priority: HIGH)
- Resume upload (PDF/DOCX) → text extraction → AI analysis
- Scoring dimensions: Skill Match %, Relevance %, Resume Quality %
- AI-generated content detection (flag AI-written resumes)
- Structured output via Claude with JSON schema
- Batch processing for bulk uploads

#### 3. CV-Vacancy Matching with Knock-Out Criteria (Priority: HIGH)
- Per-job configurable knock-out criteria (hard requirements)
- Per-job scoring criteria (weighted soft requirements)
- Automated matching: parse CV → check knock-outs → score criteria
- Match report generation (like the PDF example)
- Dutch + English language support

#### 4. Smart Candidate Pool (Priority: MEDIUM)
- Searchable talent database from all uploaded resumes
- Auto-tagging by skills, experience, location
- Re-match candidates when new jobs are posted
- Candidate deduplication

#### 5. ATS Pipeline Enhancement (Priority: MEDIUM)
- Real drag-and-drop Kanban (dnd-kit)
- Stage automation (auto-advance on criteria)
- Email notifications at stage transitions
- Interview scheduling with calendar integration

#### 6. Backend API Routes (Priority: HIGH)
- `/api/candidates` - CRUD + bulk upload
- `/api/jobs` - CRUD + scraper management
- `/api/applications` - CRUD + AI matching
- `/api/ai/grade-resume` - Resume grading endpoint
- `/api/ai/match` - CV-vacancy matching endpoint
- `/api/scraper/run` - Trigger scraping
- `/api/scraper/config` - Manage scrape targets
- `/api/auth` - Supabase auth integration

#### 7. Authentication (Priority: HIGH)
- Supabase Auth (email/password + OAuth)
- Role-based access (Admin, Recruiter, Hiring Manager, Interviewer)
- Protected routes middleware

## Team Assignment (5 Agents)

### Agent 1: Backend Architect (Sonnet)
- Supabase schema + migrations
- All API routes
- Auth middleware
- File upload/storage

### Agent 2: AI Engine Developer (Sonnet)
- Resume parsing (PDF/DOCX → text)
- AI grading endpoint (Claude integration)
- CV-vacancy matching with knock-out system
- AI content detection
- Match report generation

### Agent 3: Scraper Engineer (Haiku)
- Multi-platform scraper framework
- Platform adapters (Indeed, LinkedIn, etc.)
- Scraper config management UI
- Cron scheduling setup
- Deduplication logic

### Agent 4: Frontend Enhancement (Haiku)
- Connect all existing UI to real API routes
- Add drag-and-drop to pipeline
- Resume upload UI
- Scraper management dashboard page
- Match report display component

### Agent 5: Integration & Polish (Haiku)
- Wire up Supabase auth
- Connect frontend ↔ backend
- Add loading states, error handling
- Environment config
- Database seeding with realistic data
