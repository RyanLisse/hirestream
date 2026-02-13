"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Bell, Users, Sliders, Globe, Key } from "lucide-react"

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your recruitment platform preferences</p>
      </div>

      {/* AI Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <CardTitle className="text-card-foreground">AI Configuration</CardTitle>
          </div>
          <CardDescription>Customize how AI scores and ranks candidates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Skill Match Weight</Label>
              <Select defaultValue="40">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Relevance Weight</Label>
              <Select defaultValue="35">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="35">35%</SelectItem>
                  <SelectItem value="45">45%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quality Weight</Label>
              <Select defaultValue="25">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="35">35%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Auto-reject below threshold</p>
              <p className="text-xs text-muted-foreground">Automatically reject candidates scoring below 50</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Bias-free screening</p>
              <p className="text-xs text-muted-foreground">Remove names and demographics from AI assessment</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            <CardTitle className="text-card-foreground">Notifications</CardTitle>
          </div>
          <CardDescription>Control when and how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New application received", desc: "Get notified when a candidate applies", default: true },
            { label: "Interview reminders", desc: "30-minute reminder before interviews", default: true },
            { label: "Candidate stage changes", desc: "When candidates move through pipeline", default: false },
            { label: "Weekly digest", desc: "Summary of recruitment activity", default: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <CardTitle className="text-card-foreground">Team Members</CardTitle>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Invite Member
            </Button>
          </div>
          <CardDescription>Manage who has access to the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Jane Doe", email: "jane@company.com", role: "Admin" },
            { name: "Alex Turner", email: "alex@company.com", role: "Hiring Manager" },
            { name: "Jessica Park", email: "jessica@company.com", role: "Recruiter" },
            { name: "David Liu", email: "david@company.com", role: "Interviewer" },
          ].map((member) => (
            <div key={member.email} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <Select defaultValue={member.role.toLowerCase().replace(" ", "-")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-card-foreground">Security & Compliance</CardTitle>
          </div>
          <CardDescription>Data handling and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of account security</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">GDPR compliance mode</p>
              <p className="text-xs text-muted-foreground">Auto-delete candidate data after 6 months</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Audit logging</p>
              <p className="text-xs text-muted-foreground">Track all platform actions for compliance</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input value="sk-talent-*****************************" readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm">
                <Key className="mr-2 h-3.5 w-3.5" /> Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard Changes</Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Settings</Button>
      </div>
    </div>
  )
}
