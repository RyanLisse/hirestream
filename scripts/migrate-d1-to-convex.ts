#!/usr/bin/env npx tsx
/**
 * D1 → Convex Migration Script
 *
 * Exports listings from TSG app's Cloudflare D1 database
 * and imports them into HireStream's Convex jobs table.
 *
 * Usage:
 *   1. Export D1 data:
 *      cd ~/Developer/tsg-app && wrangler d1 export freelance-db --output=/tmp/d1-listings.json --json
 *
 *   2. Or use this script's built-in wrangler export:
 *      npx tsx scripts/migrate-d1-to-convex.ts
 *
 * Prerequisites:
 *   - wrangler CLI authenticated
 *   - CONVEX_DEPLOY_KEY or npx convex already configured
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const TSG_APP_DIR = resolve(process.env.HOME || '~', 'Developer/tsg-app');
const D1_DB_NAME = 'freelance-db';
const EXPORT_PATH = '/tmp/d1-listings.json';

interface D1Listing {
  id: number;
  external_id: string;
  platform: string;
  title: string;
  description?: string;
  organization?: string;
  location?: string;
  province?: string;
  rate_min?: number;
  rate_max?: number;
  hours_per_week?: number;
  hours_per_week_min?: number;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  category?: string;
  skills?: string; // JSON array string
  source_url?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  reference_code?: string;
  published_at?: string;
  contract_type?: string;
  duration?: string;
  education_level?: string;
  extension_option?: string;
  remote_work_policy?: string;
  raw_data?: string;
  created_at?: string;
  updated_at?: string;
  synced_to_sf?: number;
  enriched_skills?: string;
  enriched_category?: string;
  enriched_seniority?: string;
  enriched_summary?: string;
  enriched_remote_policy?: string;
}

interface ConvexJob {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  status: string;
  platformSource: string;
  externalUrl?: string;
  scrapedAt?: number;
  salary?: string;
}

function exportD1Data(): D1Listing[] {
  console.log('📦 Exporting D1 data from TSG app...');

  try {
    // Use wrangler to query D1 directly
    const result = execSync(
      `cd "${TSG_APP_DIR}" && npx wrangler d1 execute ${D1_DB_NAME} --command "SELECT * FROM listings" --json`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    const parsed = JSON.parse(result);
    // wrangler d1 execute --json returns [{results: [...]}]
    const listings = parsed[0]?.results || parsed.results || [];
    console.log(`✓ Exported ${listings.length} listings from D1`);

    // Save to file for reference
    writeFileSync(EXPORT_PATH, JSON.stringify(listings, null, 2));
    console.log(`  Saved to ${EXPORT_PATH}`);

    return listings;
  } catch (error) {
    console.error('Failed to export from D1. Checking for cached export...');

    if (existsSync(EXPORT_PATH)) {
      const cached = JSON.parse(readFileSync(EXPORT_PATH, 'utf-8'));
      console.log(`✓ Using cached export: ${cached.length} listings`);
      return cached;
    }

    throw new Error(`D1 export failed: ${error}`);
  }
}

function transformToConvexJob(listing: D1Listing): ConvexJob {
  // Parse skills from JSON string or enriched skills
  let skills: string[] = [];
  try {
    if (listing.enriched_skills) {
      skills = JSON.parse(listing.enriched_skills);
    } else if (listing.skills) {
      skills = JSON.parse(listing.skills);
    }
  } catch {
    // skills might be comma-separated
    if (listing.skills) {
      skills = listing.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Map category or enriched category to department
  const department = listing.enriched_category || listing.category || 'IT';

  // Build salary string from rate fields
  let salary: string | undefined;
  if (listing.rate_min && listing.rate_max) {
    salary = `€${listing.rate_min}-€${listing.rate_max}/uur`;
  } else if (listing.rate_max) {
    salary = `€${listing.rate_max}/uur`;
  }

  // Build type from contract_type or hours
  const type = listing.contract_type || (listing.hours_per_week ? `${listing.hours_per_week} uur/week` : 'freelance');

  return {
    title: listing.title,
    department,
    location: listing.location || listing.province || 'Nederland',
    type,
    description: listing.description || listing.enriched_summary || listing.title,
    requirements: skills,
    status: 'active',
    platformSource: listing.platform,
    externalUrl: listing.source_url,
    scrapedAt: listing.created_at ? new Date(listing.created_at).getTime() : Date.now(),
    salary,
  };
}

async function importToConvex(jobs: ConvexJob[]) {
  console.log(`\n📥 Importing ${jobs.length} jobs to Convex...`);

  // Write jobs as JSONL for Convex import
  const convexImportPath = '/tmp/convex-jobs-import.jsonl';
  const jsonl = jobs.map(j => JSON.stringify(j)).join('\n');
  writeFileSync(convexImportPath, jsonl);

  console.log(`  Wrote JSONL to ${convexImportPath}`);
  console.log(`\n  To import into Convex, run:`);
  console.log(`    npx convex import --table jobs ${convexImportPath}`);
  console.log(`\n  Or import via the Convex dashboard.`);

  // Try auto-import
  try {
    const result = execSync(
      `cd "${resolve(process.env.HOME || '~', 'Developer/v0-recruitment-dashboard')}" && npx convex import --table jobs "${convexImportPath}" --yes 2>&1`,
      { encoding: 'utf-8', timeout: 60000 }
    );
    console.log(`\n✓ Import result:\n${result}`);
  } catch (error: any) {
    console.log(`\n⚠️ Auto-import not available (Convex may not be configured yet).`);
    console.log(`  Run manually: npx convex import --table jobs ${convexImportPath}`);
  }
}

async function main() {
  console.log('🚀 D1 → Convex Migration');
  console.log('========================\n');

  // Step 1: Export from D1
  const listings = exportD1Data();

  if (listings.length === 0) {
    console.log('No listings to migrate.');
    return;
  }

  // Step 2: Transform to Convex format
  console.log(`\n🔄 Transforming ${listings.length} listings to Convex format...`);
  const jobs = listings.map(transformToConvexJob);

  // Stats
  const platforms = new Map<string, number>();
  for (const j of jobs) {
    platforms.set(j.platformSource, (platforms.get(j.platformSource) || 0) + 1);
  }
  console.log('  Platform breakdown:');
  for (const [platform, count] of platforms) {
    console.log(`    ${platform}: ${count} jobs`);
  }

  // Step 3: Import to Convex
  await importToConvex(jobs);

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
