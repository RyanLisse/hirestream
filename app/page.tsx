"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Vacatures } from "@/components/dashboard/vacatures"
import { AIChat } from "@/components/dashboard/ai-chat"

const pageHeaders: Record<string, { title: string; description: string }> = {
  vacatures: { title: "Vacatures", description: "Alle gescrapete opdrachten van Striive, Opdrachtoverheid en Flextender." },
  scrapers: { title: "Scrapers", description: "Beheer platformkoppelingen en synchronisatie-instellingen." },
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("vacatures")

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
          {activeTab === "vacatures" && <Vacatures />}
          {activeTab === "scrapers" && (
            <div className="text-muted-foreground text-sm">Scrapers — binnenkort beschikbaar.</div>
          )}
        </div>
      </main>
      <AIChat />
    </div>
  )
}
