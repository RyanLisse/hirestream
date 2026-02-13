import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  candidates: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    resumeText: v.optional(v.string()),
    aiScore: v.optional(v.number()),
    aiContentScore: v.optional(v.number()),
    skills: v.array(v.string()),
    experienceYears: v.optional(v.number()),
    education: v.optional(v.string()),
    source: v.string(),
    status: v.string(), // new, screening, interview, offer, hired, rejected
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .searchIndex("search_candidates", {
      searchField: "name",
      filterFields: ["status"]
    }),

  jobs: defineTable({
    title: v.string(),
    department: v.string(),
    location: v.string(),
    type: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    knockOutCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      description: v.string(),
      required: v.boolean(),
    }))),
    scoringCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      weight: v.number(),
      description: v.string(),
    }))),
    status: v.string(), // active, paused, closed
    platformSource: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    scrapedAt: v.optional(v.number()),
    salary: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .searchIndex("search_jobs", {
      searchField: "title",
      filterFields: ["status", "department"]
    }),

  applications: defineTable({
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
    status: v.string(),
    stage: v.string(), // new, screening, interview, offer, hired, rejected
    aiMatchScore: v.optional(v.number()),
    knockOutResults: v.optional(v.any()),
    scoringResults: v.optional(v.any()),
    notes: v.optional(v.string()),
  })
    .index("by_candidate", ["candidateId"])
    .index("by_job", ["jobId"])
    .index("by_stage", ["stage"])
    .index("by_status", ["status"]),

  interviews: defineTable({
    applicationId: v.id("applications"),
    candidateName: v.string(),
    role: v.string(),
    type: v.string(), // phone, video, onsite, technical
    date: v.string(),
    time: v.string(),
    interviewer: v.string(),
    status: v.string(), // scheduled, completed, cancelled
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
  })
    .index("by_application", ["applicationId"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  messages: defineTable({
    applicationId: v.optional(v.id("applications")),
    template: v.string(),
    subject: v.string(),
    body: v.string(),
    recipients: v.number(),
    status: v.string(), // sent, draft, scheduled
    openRate: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_application", ["applicationId"]),

  scraperConfigs: defineTable({
    platform: v.string(),
    baseUrl: v.string(),
    searchQuery: v.string(),
    selectors: v.optional(v.any()),
    schedule: v.string(), // hourly, daily, weekly
    active: v.boolean(),
    lastRun: v.optional(v.number()),
    lastJobsFound: v.optional(v.number()),
  })
    .index("by_platform", ["platform"])
    .index("by_active", ["active"]),

  scrapeResults: defineTable({
    configId: v.id("scraperConfigs"),
    jobsFound: v.number(),
    jobsNew: v.number(),
    errors: v.optional(v.string()),
    runAt: v.number(),
  })
    .index("by_config", ["configId"])
    .index("by_runAt", ["runAt"]),

  // Agent-native: context store for accumulated knowledge
  agentContext: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_updatedAt", ["updatedAt"]),
});
