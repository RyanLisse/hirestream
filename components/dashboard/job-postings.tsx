"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BriefcaseBusiness,
  Plus,
  MapPin,
  Users,
  Clock,
  MoreHorizontal,
  ExternalLink,
  Pause,
  Play,
  Archive,
  Building,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { jobs } from "@/lib/data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-accent/10 text-accent">
          <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Active
        </Badge>
      )
    case "paused":
      return (
        <Badge className="bg-warning/10 text-warning">
          <Pause className="mr-1 h-3 w-3" /> Paused
        </Badge>
      )
    case "closed":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          <Archive className="mr-1 h-3 w-3" /> Closed
        </Badge>
      )
    default:
      return null
  }
}

export function JobPostings() {
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = statusFilter === "all" ? jobs : jobs.filter((j) => j.status === statusFilter)
  const activeCount = jobs.filter((j) => j.status === "active").length
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Job Postings</h2>
          <p className="text-sm text-muted-foreground">Manage open positions and track applicant flow</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
                <DialogDescription>Add a new open position to your recruitment pipeline</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="ai-ml">AI/ML</SelectItem>
                        <SelectItem value="infra">Infrastructure</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g. San Francisco, CA or Remote" />
                </div>
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <Input placeholder="e.g. React, TypeScript, Node.js" />
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Job Description</Label>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                      <Sparkles className="mr-1.5 h-3 w-3" /> Generate with AI
                    </Button>
                  </div>
                  <Textarea placeholder="Describe the role, responsibilities, and requirements..." className="min-h-[120px]" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Publish</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Positions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalApplicants}</p>
              <p className="text-xs text-muted-foreground">Total Applicants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {Math.round(totalApplicants / jobs.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Per Position</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((job) => {
          const daysAgo = Math.floor(
            (new Date().getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          return (
            <Card key={job.id} className="border-border bg-card transition-all hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-card-foreground">{job.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1.5">
                      <Building className="h-3 w-3" />
                      {job.department}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions for {job.title}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Posting
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {job.status === "active" ? (
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-3.5 w-3.5" /> Pause
                        </DropdownMenuItem>
                      ) : job.status === "paused" ? (
                        <DropdownMenuItem>
                          <Play className="mr-2 h-3.5 w-3.5" /> Resume
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-destructive">
                        <Archive className="mr-2 h-3.5 w-3.5" /> Close
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusIndicator status={job.status} />
                  <span className="text-xs text-muted-foreground">{daysAgo}d ago</span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Applicants</span>
                    <span className="font-semibold text-card-foreground">{job.applicants}</span>
                  </div>
                  <Progress value={Math.min((job.applicants / 60) * 100, 100)} className="h-1.5" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Users className="mr-1.5 h-3.5 w-3.5" /> View Applicants
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">View external posting</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
