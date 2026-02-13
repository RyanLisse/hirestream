"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  Search,
  Filter,
  Users,
  Download,
  Mail,
  Tag,
  MapPin,
  Briefcase,
  Star,
  MoreHorizontal,
  Plus,
  DatabaseZap,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { candidates, type Candidate } from "@/lib/data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const allSkills = Array.from(new Set(candidates.flatMap((c) => c.skills))).sort()
const allLocations = Array.from(new Set(candidates.map((c) => c.location))).sort()

export function TalentPool() {
  const [search, setSearch] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const filtered = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    const matchSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => c.skills.includes(skill))
    const matchLocation = locationFilter === "all" || c.location === locationFilter
    const matchExperience =
      experienceFilter === "all" ||
      (experienceFilter === "junior" && parseInt(c.experience) <= 3) ||
      (experienceFilter === "mid" && parseInt(c.experience) >= 4 && parseInt(c.experience) <= 6) ||
      (experienceFilter === "senior" && parseInt(c.experience) >= 7)
    return matchSearch && matchSkills && matchLocation && matchExperience
  })

  const toggleSelect = (id: string) => {
    setSelectedCandidates((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedCandidates.length === filtered.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(filtered.map((c) => c.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <DatabaseZap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-card-foreground">Smart Talent Pool</h2>
                <p className="text-sm text-muted-foreground">
                  {candidates.length} profiles indexed and searchable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3.5 w-3.5" /> Export
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                <Plus className="mr-2 h-3.5 w-3.5" /> Import Resumes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-primary text-primary-foreground" : ""}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            {(selectedSkills.length > 0 || locationFilter !== "all" || experienceFilter !== "all") && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {selectedSkills.length + (locationFilter !== "all" ? 1 : 0) + (experienceFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="border-border bg-card">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-card-foreground">Advanced Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSkills([])
                    setLocationFilter("all")
                    setExperienceFilter("all")
                  }}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Clear All
                </Button>
              </div>

              {/* Skills */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {allSkills.map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      className={`h-7 text-xs ${selectedSkills.includes(skill) ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Location</p>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[200px]">
                      <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {allLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Experience Level</p>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Briefcase className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="junior">Junior (1-3 yrs)</SelectItem>
                      <SelectItem value="mid">Mid (4-6 yrs)</SelectItem>
                      <SelectItem value="senior">Senior (7+ yrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filter Tags */}
              {(selectedSkills.length > 0 || locationFilter !== "all" || experienceFilter !== "all") && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button onClick={() => toggleSkill(skill)} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" aria-label={`Remove ${skill} filter`}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {locationFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {locationFilter}
                      <button onClick={() => setLocationFilter("all")} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" aria-label="Remove location filter">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-3">
            <span className="text-sm font-medium text-primary">
              {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Mail className="mr-1.5 h-3.5 w-3.5" /> Bulk Message
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Tag className="mr-1.5 h-3.5 w-3.5" /> Add Tags
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedCandidates.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                    aria-label="Select all candidates"
                  />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Skills</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead className="hidden md:table-cell">Experience</TableHead>
                <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((candidate) => (
                <TableRow key={candidate.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={() => toggleSelect(candidate.id)}
                      aria-label={`Select ${candidate.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                          {candidate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{candidate.name}</p>
                        <p className="text-[11px] text-muted-foreground">{candidate.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{candidate.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{candidate.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{candidate.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          candidate.score >= 90
                            ? "bg-accent"
                            : candidate.score >= 80
                            ? "bg-primary"
                            : candidate.score >= 70
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                      <span className="text-sm font-semibold text-card-foreground">{candidate.score}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{candidate.experience}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions for {candidate.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Add to Pipeline</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Download Resume</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No candidates match your criteria</p>
              <p className="text-xs text-muted-foreground/60">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
