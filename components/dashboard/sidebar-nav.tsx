"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  FileText,
  Users,
  BriefcaseBusiness,
  Calendar,
  MessageSquare,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "grading", label: "AI Grading", icon: Brain, badge: "AI" },
  { id: "pipeline", label: "Pipeline", icon: FileText },
  { id: "talent-pool", label: "Talent Pool", icon: Users },
  { id: "jobs", label: "Job Postings", icon: BriefcaseBusiness },
  { id: "interviews", label: "Interviews", icon: Calendar, badge: "3" },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
]

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold tracking-tight text-sidebar-primary-foreground">
              TalentAI
            </span>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-sm text-sidebar-foreground/60">
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-auto rounded border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                {"/"} 
              </kbd>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-3 py-3" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const linkContent = (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badge === "AI" ? "default" : "secondary"}
                        className={cn(
                          "ml-auto h-5 px-1.5 text-[10px]",
                          item.badge === "AI"
                            ? "bg-accent text-accent-foreground"
                            : "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            return linkContent
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                JD
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-sidebar-accent-foreground">Jane Doe</p>
                <p className="text-xs text-sidebar-foreground/60">Hiring Manager</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
