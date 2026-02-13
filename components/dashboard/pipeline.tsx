"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronRight,
  MoreHorizontal,
  Plus,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  GripVertical,
} from "lucide-react"
import { candidates, jobs, type Candidate } from "@/lib/data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const stages = [
  { id: "new", label: "New", color: "bg-muted-foreground" },
  { id: "screening", label: "Screening", color: "bg-primary" },
  { id: "interview", label: "Interview", color: "bg-warning" },
  { id: "offer", label: "Offer", color: "bg-accent" },
  { id: "hired", label: "Hired", color: "bg-success" },
] as const

type StageId = (typeof stages)[number]["id"]

function CandidateCard({ candidate, onMoveStage }: { candidate: Candidate; onMoveStage: (id: string, stage: Candidate["status"]) => void }) {
  const scoreColor =
    candidate.score >= 90
      ? "text-accent"
      : candidate.score >= 80
      ? "text-primary"
      : candidate.score >= 70
      ? "text-warning"
      : "text-destructive"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-4 w-4" />
            </div>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{candidate.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-card-foreground">{candidate.name}</p>
              <p className="text-[11px] text-muted-foreground">{candidate.role}</p>
            </div>
            <span className={`text-sm font-bold ${scoreColor}`}>{candidate.score}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 2).map((skill) => (
              <span key={skill} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {skill}
              </span>
            ))}
            {candidate.tags.slice(0, 1).map((tag) => (
              <span key={tag} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{candidate.source}</span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(candidate.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">{candidate.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-card-foreground">{candidate.name}</span>
              <p className="text-sm font-normal text-muted-foreground">{candidate.role}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">Candidate details for {candidate.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-secondary p-2.5">
              <p className="text-lg font-bold text-primary">{candidate.skillMatch}%</p>
              <p className="text-[10px] text-muted-foreground">Skill Match</p>
            </div>
            <div className="rounded-lg bg-secondary p-2.5">
              <p className="text-lg font-bold text-accent">{candidate.relevance}%</p>
              <p className="text-[10px] text-muted-foreground">Relevance</p>
            </div>
            <div className="rounded-lg bg-secondary p-2.5">
              <p className="text-lg font-bold text-warning">{candidate.resumeQuality}%</p>
              <p className="text-[10px] text-muted-foreground">Quality</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{candidate.experience} experience</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-card-foreground">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-card-foreground">Move to Stage</p>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={candidate.status === stage.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => onMoveStage(candidate.id, stage.id)}
                >
                  {stage.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
              <Mail className="mr-2 h-3.5 w-3.5" /> Send Message
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Schedule Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function Pipeline() {
  const [candidateData, setCandidateData] = useState(candidates)
  const [selectedJob, setSelectedJob] = useState("all")

  const moveStage = (candidateId: string, newStage: Candidate["status"]) => {
    setCandidateData((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStage } : c))
    )
  }

  const filteredCandidates = selectedJob === "all" ? candidateData : candidateData.filter((c) => c.role === jobs.find((j) => j.id === selectedJob)?.title)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Recruitment Pipeline</h2>
          <p className="text-sm text-muted-foreground">Drag candidates through stages to track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {jobs.filter((j) => j.status === "active").map((job) => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Candidate
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = filteredCandidates.filter((c) => c.status === stage.id)
          return (
            <div key={stage.id} className="min-w-[280px] flex-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {stageCandidates.length}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Stage options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Sort by Score</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                    <DropdownMenuItem>Bulk Actions</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2 rounded-xl bg-secondary/50 p-2">
                {stageCandidates.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <p className="text-xs text-muted-foreground">No candidates</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} onMoveStage={moveStage} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats Bar */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-6">
            {stages.map((stage) => {
              const count = filteredCandidates.filter((c) => c.status === stage.id).length
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs text-muted-foreground">{stage.label}:</span>
                  <span className="text-xs font-semibold text-card-foreground">{count}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5 text-accent" />
            Avg. time through pipeline: <span className="font-semibold text-card-foreground">18 days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
