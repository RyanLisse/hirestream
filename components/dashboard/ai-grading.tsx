"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Eye,
  Download,
  BarChart3,
  Shield,
  Lightbulb,
  TrendingUp,
  X,
} from "lucide-react"
import { candidates, type Candidate } from "@/lib/data"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

function ScoreRing({ score, size = 80, strokeWidth = 6 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 90 ? "hsl(160, 70%, 42%)" : score >= 80 ? "hsl(217, 91%, 52%)" : score >= 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(220, 16%, 88%)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-card-foreground">{score}</span>
      </div>
    </div>
  )
}

function GradeLabel({ score }: { score: number }) {
  if (score >= 90) return <Badge className="bg-accent text-accent-foreground">Excellent</Badge>
  if (score >= 80) return <Badge className="bg-primary text-primary-foreground">Strong</Badge>
  if (score >= 70) return <Badge className="bg-warning text-warning-foreground">Good</Badge>
  return <Badge variant="destructive">Below Threshold</Badge>
}

function CandidateDetail({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const radarData = [
    { metric: "Skill Match", value: candidate.skillMatch },
    { metric: "Relevance", value: candidate.relevance },
    { metric: "Resume Quality", value: candidate.resumeQuality },
    { metric: "Experience", value: Math.min(candidate.score + 3, 100) },
    { metric: "Education", value: Math.min(candidate.score - 2, 100) },
  ]

  const strengths = candidate.skills.slice(0, 3)
  const improvements =
    candidate.score < 85
      ? ["Could elaborate more on project outcomes", "Add quantifiable achievements"]
      : ["Consider adding leadership examples"]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">{candidate.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-card-foreground">{candidate.name}</CardTitle>
              <CardDescription>{candidate.role}</CardDescription>
              <div className="mt-1 flex items-center gap-2">
                <GradeLabel score={candidate.score} />
                <span className="text-xs text-muted-foreground">{candidate.experience} experience</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-card-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close details</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="rounded-xl border border-border bg-secondary/50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Brain className="h-4 w-4 text-primary" /> AI Assessment Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 16%, 88%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} />
              <Radar dataKey="value" stroke="hsl(217, 91%, 52%)" fill="hsl(217, 91%, 52%)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-primary">{candidate.skillMatch}%</p>
            <p className="text-[11px] text-muted-foreground">Skill Match</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-accent">{candidate.relevance}%</p>
            <p className="text-[11px] text-muted-foreground">Relevance</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-warning">{candidate.resumeQuality}%</p>
            <p className="text-[11px] text-muted-foreground">Quality</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent" /> Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="bg-accent/5 text-accent">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent">
              <TrendingUp className="h-4 w-4" /> Strengths
            </h4>
            <ul className="space-y-1">
              {strengths.map((s) => (
                <li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
              <Lightbulb className="h-4 w-4" /> Suggestions
            </h4>
            <ul className="space-y-1">
              {improvements.map((s) => (
                <li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" /> View Resume
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AIGrading() {
  const [search, setSearch] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score")
  const [selected, setSelected] = useState<Candidate | null>(null)

  const filtered = candidates
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
      const matchScore =
        scoreFilter === "all" ||
        (scoreFilter === "excellent" && c.score >= 90) ||
        (scoreFilter === "strong" && c.score >= 80 && c.score < 90) ||
        (scoreFilter === "good" && c.score >= 70 && c.score < 80) ||
        (scoreFilter === "below" && c.score < 70)
      return matchSearch && matchScore
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    })

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Panel - Candidate List */}
      <div className={selected ? "lg:col-span-7" : "lg:col-span-12"}>
        {/* Header */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-card-foreground">AI Resume Grading</h2>
                  <p className="text-sm text-muted-foreground">
                    Instant assessment based on skill matching, relevance & quality
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3 text-accent" />
                  {candidates.length} Graded
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  Bias-Free
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="excellent">Excellent (90+)</SelectItem>
              <SelectItem value="strong">Strong (80-89)</SelectItem>
              <SelectItem value="good">Good (70-79)</SelectItem>
              <SelectItem value="below">Below ({"<"}70)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">By Score</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Excellent", count: candidates.filter((c) => c.score >= 90).length, color: "text-accent" },
            { label: "Strong", count: candidates.filter((c) => c.score >= 80 && c.score < 90).length, color: "text-primary" },
            { label: "Good", count: candidates.filter((c) => c.score >= 70 && c.score < 80).length, color: "text-warning" },
            { label: "Below", count: candidates.filter((c) => c.score < 70).length, color: "text-destructive" },
          ].map((item) => (
            <Card key={item.label} className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-3">
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                <span className={`text-xl font-bold ${item.color}`}>{item.count}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Candidate List */}
        <div className="space-y-2">
          {filtered.map((candidate) => (
            <Card
              key={candidate.id}
              className={`cursor-pointer border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm ${
                selected?.id === candidate.id ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setSelected(candidate)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <ScoreRing score={candidate.score} size={56} strokeWidth={4} />
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">{candidate.name}</p>
                    <GradeLabel score={candidate.score} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{candidate.role}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{candidate.skills.length - 4} more</span>
                    )}
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground">Skill</span>
                      <Progress value={candidate.skillMatch} className="h-1.5 w-16" />
                      <span className="w-7 text-right text-[10px] font-medium text-card-foreground">{candidate.skillMatch}%</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground">Rel.</span>
                      <Progress value={candidate.relevance} className="h-1.5 w-16" />
                      <span className="w-7 text-right text-[10px] font-medium text-card-foreground">{candidate.relevance}%</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground">Qual.</span>
                      <Progress value={candidate.resumeQuality} className="h-1.5 w-16" />
                      <span className="w-7 text-right text-[10px] font-medium text-card-foreground">{candidate.resumeQuality}%</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel - Detail */}
      {selected && (
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
