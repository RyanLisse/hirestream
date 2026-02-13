import { createHash } from "crypto"
import { ScrapedJob } from "./index"

export interface DeduplicationStore {
  hashes: Set<string>
  addHash(hash: string): void
  hasHash(hash: string): boolean
}

export function createDeduplicationStore(): DeduplicationStore {
  return {
    hashes: new Set(),
    addHash(hash: string): void {
      this.hashes.add(hash)
    },
    hasHash(hash: string): boolean {
      return this.hashes.has(hash)
    },
  }
}

export function generateJobHash(job: ScrapedJob): string {
  const normalized = normalizeString(`${job.title}${job.company}${job.location}`)
  return createHash("sha256").update(normalized).digest("hex")
}

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, "")
}

export function isDuplicateJob(job: ScrapedJob, store: DeduplicationStore): boolean {
  const hash = generateJobHash(job)
  return store.hasHash(hash)
}

export function addJobToStore(job: ScrapedJob, store: DeduplicationStore): void {
  const hash = generateJobHash(job)
  store.addHash(hash)
}

export function filterDuplicates(jobs: ScrapedJob[], store: DeduplicationStore): ScrapedJob[] {
  const newJobs: ScrapedJob[] = []

  for (const job of jobs) {
    if (!isDuplicateJob(job, store)) {
      newJobs.push(job)
      addJobToStore(job, store)
    }
  }

  return newJobs
}

export function loadJobsIntoStore(jobs: ScrapedJob[], store: DeduplicationStore): void {
  for (const job of jobs) {
    addJobToStore(job, store)
  }
}
