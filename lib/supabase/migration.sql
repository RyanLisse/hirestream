-- AI Recruitment Platform Database Schema
-- This migration creates all tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  resume_url TEXT,
  resume_text TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_content_score INTEGER CHECK (ai_content_score >= 0 AND ai_content_score <= 100),
  skills TEXT[],
  experience_years INTEGER CHECK (experience_years >= 0),
  education TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT,
  description TEXT,
  requirements TEXT[],
  knock_out_criteria JSONB[],
  scoring_criteria JSONB[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  platform_source TEXT,
  external_url TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT,
  stage TEXT,
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  knock_out_results JSONB,
  scoring_results JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('phone', 'video', 'onsite', 'technical')),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  interviewer TEXT,
  status TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  template TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipients INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('sent', 'draft', 'scheduled')),
  open_rate FLOAT CHECK (open_rate >= 0 AND open_rate <= 1),
  sent_at TIMESTAMPTZ
);

-- Scrape configs table
CREATE TABLE IF NOT EXISTS scrape_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  base_url TEXT NOT NULL,
  search_query TEXT,
  selectors JSONB,
  schedule TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_score ON candidates(ai_score DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_platform_source ON jobs(platform_source);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

CREATE INDEX IF NOT EXISTS idx_messages_application_id ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_scrape_configs_platform ON scrape_configs(platform);
CREATE INDEX IF NOT EXISTS idx_scrape_configs_active ON scrape_configs(active);

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for authenticated users)
-- In production, you should refine these based on your auth requirements

-- Candidates policies
CREATE POLICY "Allow all for authenticated users" ON candidates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON candidates
  FOR ALL USING (auth.role() = 'service_role');

-- Jobs policies
CREATE POLICY "Allow all for authenticated users" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Applications policies
CREATE POLICY "Allow all for authenticated users" ON applications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON applications
  FOR ALL USING (auth.role() = 'service_role');

-- Interviews policies
CREATE POLICY "Allow all for authenticated users" ON interviews
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON interviews
  FOR ALL USING (auth.role() = 'service_role');

-- Messages policies
CREATE POLICY "Allow all for authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON messages
  FOR ALL USING (auth.role() = 'service_role');

-- Scrape configs policies
CREATE POLICY "Allow all for authenticated users" ON scrape_configs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access" ON scrape_configs
  FOR ALL USING (auth.role() = 'service_role');
