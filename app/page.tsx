"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Overview } from "@/components/dashboard/overview"
import { AIGrading } from "@/components/dashboard/ai-grading"
import { Pipeline } from "@/components/dashboard/pipeline"
import { TalentPool } from "@/components/dashboard/talent-pool"
import { Interviews } from "@/components/dashboard/interviews"
import { Messages } from "@/components/dashboard/messages"
import { JobPostings } from "@/components/dashboard/job-postings"
import { Settings } from "@/components/dashboard/settings"

const pageHeaders: Record<string, { title: string; description: string }> = {
  overview: { title: "Dashboard Overview", description: "Welcome back, Jane. Here's your recruitment activity at a glance." },
  grading: { title: "AI Resume Grading", description: "Instant assessment based on skill matching, relevance & quality metrics." },
  pipeline: { title: "Recruitment Pipeline", description: "Track candidates through every stage of the hiring process." },
  "talent-pool": { title: "Smart Talent Pool", description: "Searchable database of all candidate profiles." },
  jobs: { title: "Job Postings", description: "Manage open positions and applicant flow." },
  interviews: { title: "Interview Management", description: "Schedule, track, and collect interview feedback." },
  messages: { title: "Messaging Center", description: "Bulk messaging, templates, and communication tracking." },
  scrapers: { title: "Scrapers", description: "Manage candidate sourcing and data collection." },
  settings: { title: "Settings", description: "Configure your recruitment platform preferences." },
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card px-8 py-5">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            {pageHeaders[activeTab]?.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pageHeaders[activeTab]?.description}
          </p>
        </div>
        <div className="p-8">
          {activeTab === "overview" && <Overview />}
          {activeTab === "grading" && <AIGrading />}
          {activeTab === "pipeline" && <Pipeline />}
          {activeTab === "talent-pool" && <TalentPool />}
          {activeTab === "jobs" && <JobPostings />}
          {activeTab === "interviews" && <Interviews />}
          {activeTab === "messages" && <Messages />}
          {activeTab === "scrapers" && <div className="text-muted-foreground">Scraper dashboard coming soon...</div>}
          {activeTab === "settings" && <Settings />}
        </div>
      </main>
    </div>
  )
}
