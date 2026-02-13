"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MessageSquare,
  Send,
  Plus,
  Mail,
  Eye,
  Clock,
  CheckCircle2,
  FileEdit,
  Users,
  Sparkles,
  Copy,
  BarChart3,
} from "lucide-react"
import { messages } from "@/lib/data"

const templates = [
  { id: "ack", name: "Application Acknowledgment", preview: "Thank you for applying to [Position]..." },
  { id: "interview", name: "Interview Confirmation", preview: "We are pleased to invite you for an interview..." },
  { id: "status", name: "Status Update", preview: "We wanted to update you on the status of your application..." },
  { id: "offer", name: "Offer Letter", preview: "We are excited to extend you an offer for [Position]..." },
  { id: "rejection", name: "Rejection (Polite)", preview: "Thank you for your interest. After careful consideration..." },
  { id: "outreach", name: "Talent Outreach", preview: "We came across your profile and believe you'd be a great fit..." },
]

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-accent/10 text-accent">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Sent
        </Badge>
      )
    case "draft":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <FileEdit className="mr-1 h-3 w-3" /> Draft
        </Badge>
      )
    case "scheduled":
      return (
        <Badge className="bg-primary/10 text-primary">
          <Clock className="mr-1 h-3 w-3" /> Scheduled
        </Badge>
      )
    default:
      return null
  }
}

export function Messages() {
  const [tab, setTab] = useState("all")
  const [composeOpen, setComposeOpen] = useState(false)

  const sentMessages = messages.filter((m) => m.status === "sent")
  const draftMessages = messages.filter((m) => m.status === "draft")
  const scheduledMessages = messages.filter((m) => m.status === "scheduled")

  const avgOpenRate = Math.round(
    sentMessages.filter((m) => m.openRate).reduce((sum, m) => sum + (m.openRate || 0), 0) /
      sentMessages.filter((m) => m.openRate).length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Messaging Center</h2>
          <p className="text-sm text-muted-foreground">Bulk messaging, templates, and communication tracking</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>Send a message to candidates or team members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select>
                  <SelectTrigger>
                    <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Select recipients..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-new">All New Applicants (24)</SelectItem>
                    <SelectItem value="screening">Screening Candidates (18)</SelectItem>
                    <SelectItem value="interview">Interview Stage (12)</SelectItem>
                    <SelectItem value="offer">Offer Recipients (5)</SelectItem>
                    <SelectItem value="custom">Custom Selection...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Message subject..." />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Message</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                    <Sparkles className="mr-1.5 h-3 w-3" /> AI Assist
                  </Button>
                </div>
                <Textarea placeholder="Write your message..." className="min-h-[150px]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Clock className="mr-1.5 h-3.5 w-3.5" /> Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Save Draft
                  </Button>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{sentMessages.length}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Eye className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{avgOpenRate}%</p>
              <p className="text-xs text-muted-foreground">Avg Open Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FileEdit className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{draftMessages.length}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{scheduledMessages.length}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Message Templates</CardTitle>
              <CardDescription>Quick-use templates for common communications</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-3.5 w-3.5" /> New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group cursor-pointer rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium text-card-foreground">{template.name}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy template {template.name}</span>
                  </Button>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{template.preview}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Message History</CardTitle>
          <CardDescription>Track all sent, drafted, and scheduled messages</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={tab} onValueChange={setTab} className="px-6 pt-0 pb-0">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({sentMessages.length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({draftMessages.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledMessages.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Subject</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="hidden md:table-cell">Recipients</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Open Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tab === "all"
                ? messages
                : messages.filter((m) => m.status === tab)
              ).map((message) => (
                <TableRow key={message.id} className="cursor-pointer">
                  <TableCell className="font-medium text-card-foreground">{message.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{message.template}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" /> {message.recipients}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {message.sentDate
                      ? new Date(message.sentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={message.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {message.openRate ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${message.openRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{message.openRate}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
