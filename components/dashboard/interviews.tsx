"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Star,
  Plus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Filter,
  CalendarDays,
} from "lucide-react"
import { interviews, type Interview } from "@/lib/data"

function InterviewTypeIcon({ type }: { type: Interview["type"] }) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />
    case "phone":
      return <Phone className="h-4 w-4" />
    case "onsite":
      return <MapPin className="h-4 w-4" />
    case "technical":
      return <FileText className="h-4 w-4" />
  }
}

function InterviewCard({ interview }: { interview: Interview }) {
  const isUpcoming = interview.status === "scheduled"
  const isPast = interview.status === "completed"
  const date = new Date(interview.date)
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
  const dayNum = date.getDate()
  const month = date.toLocaleDateString("en-US", { month: "short" })

  return (
    <Card className={`border-border bg-card transition-all hover:shadow-sm ${isUpcoming ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="flex gap-4 p-4">
        {/* Date Block */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-3 py-2 text-center">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">{dayName}</span>
          <span className="text-xl font-bold text-card-foreground">{dayNum}</span>
          <span className="text-[10px] text-muted-foreground">{month}</span>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-card-foreground">{interview.candidateName}</h4>
              <p className="text-xs text-muted-foreground">{interview.role}</p>
            </div>
            <Badge
              variant={isUpcoming ? "default" : isPast ? "secondary" : "destructive"}
              className={isUpcoming ? "bg-primary text-primary-foreground" : ""}
            >
              {interview.status}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {interview.time}
            </span>
            <span className="flex items-center gap-1">
              <InterviewTypeIcon type={interview.type} />
              {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {interview.interviewer}
            </span>
          </div>

          {/* Feedback for completed */}
          {isPast && interview.feedback && (
            <div className="mt-3 rounded-lg bg-secondary p-2.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-card-foreground">Feedback</span>
                {interview.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < interview.rating! ? "fill-warning text-warning" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{interview.feedback}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            {isUpcoming && (
              <>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Video className="mr-1.5 h-3 w-3" /> Join
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Reschedule
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive">
                  Cancel
                </Button>
              </>
            )}
            {isPast && !interview.feedback && (
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <MessageSquare className="mr-1.5 h-3 w-3" /> Add Feedback
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Interviews() {
  const [tab, setTab] = useState("upcoming")
  const [typeFilter, setTypeFilter] = useState("all")

  const upcoming = interviews.filter((i) => i.status === "scheduled")
  const completed = interviews.filter((i) => i.status === "completed")
  const cancelled = interviews.filter((i) => i.status === "cancelled")

  const filterByType = (list: Interview[]) =>
    typeFilter === "all" ? list : list.filter((i) => i.type === typeFilter)

  // Calendar view data
  const today = new Date()
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Interview Management</h2>
          <p className="text-sm text-muted-foreground">Schedule, track, and collect feedback</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>Set up an interview session with a candidate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Candidate</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">Sarah Chen</SelectItem>
                        <SelectItem value="c2">Marcus Johnson</SelectItem>
                        <SelectItem value="c4">Daniel Kim</SelectItem>
                        <SelectItem value="c10">Maria Gonzalez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Interviewer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="i1">Alex Turner</SelectItem>
                        <SelectItem value="i2">Jessica Park</SelectItem>
                        <SelectItem value="i3">David Liu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Screen</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="technical">Technical Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add any notes or agenda items..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Schedule</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">4.5</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{cancelled.length}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly View */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dayInterviews = upcoming.filter((interview) => {
                const iDate = new Date(interview.date)
                return iDate.toDateString() === day.toDateString()
              })
              const isToday = day.toDateString() === today.toDateString()
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-2 text-center ${
                    isToday ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-card-foreground"}`}>
                    {day.getDate()}
                  </p>
                  {dayInterviews.length > 0 && (
                    <div className="mt-1 flex justify-center gap-0.5">
                      {dayInterviews.map((_, idx) => (
                        <div key={idx} className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({interviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {filterByType(upcoming).map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
          {filterByType(upcoming).length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming interviews</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4 space-y-3">
          {filterByType(completed).map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </TabsContent>
        <TabsContent value="all" className="mt-4 space-y-3">
          {filterByType(interviews).map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
