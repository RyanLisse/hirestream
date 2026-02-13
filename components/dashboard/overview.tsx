"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  BriefcaseBusiness,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star,
  Target,
  Zap,
} from "lucide-react"
import { candidates, jobs, interviews, pipelineStages } from "@/lib/data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const applicationData = [
  { month: "Sep", applications: 45, hired: 3 },
  { month: "Oct", applications: 68, hired: 5 },
  { month: "Nov", applications: 82, hired: 4 },
  { month: "Dec", applications: 56, hired: 6 },
  { month: "Jan", applications: 94, hired: 7 },
  { month: "Feb", applications: 110, hired: 4 },
]

const sourceData = [
  { name: "LinkedIn", value: 35 },
  { name: "Referral", value: 25 },
  { name: "Job Board", value: 20 },
  { name: "Career Page", value: 15 },
  { name: "Other", value: 5 },
]

const COLORS = [
  "hsl(217, 91%, 52%)",
  "hsl(160, 70%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 60%, 55%)",
]

const topCandidates = candidates
  .filter((c) => c.status !== "rejected" && c.status !== "hired")
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)

const upcomingInterviews = interviews.filter((i) => i.status === "scheduled").slice(0, 3)

export function Overview() {
  const activeJobs = jobs.filter((j) => j.status === "active").length
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0)
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">{totalApplicants}</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-accent">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12.5% this week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">{activeJobs}</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-accent">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+2 new this month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <BriefcaseBusiness className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg AI Score</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">{avgScore}</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                  <ArrowDownRight className="h-3 w-3" />
                  <span>-2.3 vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time to Hire</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">18d</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-accent">
                  <TrendingUp className="h-3 w-3" />
                  <span>-3 days improved</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="border-border bg-card lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-card-foreground">Application Trends</CardTitle>
            <CardDescription>Applications received vs hires over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={applicationData}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 52%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 16%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="hsl(217, 91%, 52%)" fill="url(#appGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="hired" stroke="hsl(160, 70%, 42%)" fill="hsl(160, 70%, 42%)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-card-foreground">Source Distribution</CardTitle>
            <CardDescription>Where candidates are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 16%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {sourceData.map((source, i) => (
                <div key={source.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {source.name} ({source.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline + Top Candidates + Interviews */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pipeline */}
        <Card className="border-border bg-card lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-card-foreground">Hiring Pipeline</CardTitle>
            <CardDescription>Current status across all positions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-card-foreground">{stage.name}</span>
                  <span className="text-muted-foreground">{stage.count}</span>
                </div>
                <Progress value={(stage.count / 30) * 100} className="h-2" />
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
              <span className="text-sm font-medium text-secondary-foreground">Total Active</span>
              <span className="text-sm font-bold text-primary">
                {pipelineStages.reduce((sum, s) => sum + s.count, 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Candidates */}
        <Card className="border-border bg-card lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Top AI-Ranked Candidates</CardTitle>
                <CardDescription>Highest scoring applicants across all roles</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-accent">
                <Zap className="h-3 w-3" />
                AI Ranked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCandidates.map((candidate, idx) => (
              <div
                key={candidate.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {idx + 1}
                </span>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {candidate.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-card-foreground">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-card-foreground">{candidate.score}</p>
                    <p className="text-[10px] text-muted-foreground">AI Score</p>
                  </div>
                  <div
                    className={`h-8 w-1 rounded-full ${
                      candidate.score >= 90
                        ? "bg-accent"
                        : candidate.score >= 80
                        ? "bg-primary"
                        : "bg-warning"
                    }`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-border bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-card-foreground">Upcoming</CardTitle>
            <CardDescription>Next scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {new Date(interview.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" at "}
                    {interview.time}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-card-foreground">{interview.candidateName}</p>
                <p className="text-xs text-muted-foreground">{interview.role}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {interview.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">w/ {interview.interviewer}</span>
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            <div className="mt-2 space-y-2 rounded-lg bg-secondary p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This week</span>
                <span className="font-semibold text-secondary-foreground">6 interviews</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completion rate</span>
                <span className="font-semibold text-accent">92%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-semibold text-secondary-foreground">4.5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
