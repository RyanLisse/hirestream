"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Search, MapPin, Clock, ExternalLink, Building2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const PLATFORMS = ["Alle", "Striive", "Opdrachtoverheid", "Flextender"] as const
type Platform = (typeof PLATFORMS)[number]

export function Vacatures() {
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState<Platform>("Alle")

  const jobs = useQuery(api.jobs.list, {
    search: search || undefined,
    limit: 200,
  })

  const filtered = jobs?.filter((j) =>
    platform === "Alle" ? true : j.platformSource?.toLowerCase() === platform.toLowerCase()
  )

  // Platform counts
  const counts = {
    Alle: jobs?.length ?? 0,
    Striive: jobs?.filter((j) => j.platformSource?.toLowerCase() === "striive").length ?? 0,
    Opdrachtoverheid: jobs?.filter((j) => j.platformSource?.toLowerCase() === "opdrachtoverheid").length ?? 0,
    Flextender: jobs?.filter((j) => j.platformSource?.toLowerCase() === "flextender").length ?? 0,
  }

  return (
    <div className="space-y-6">
      {/* Zoekbalk + platform filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Zoek op titel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
          {PLATFORMS.map((p) => (
            <Button
              key={p}
              variant={platform === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatform(p)}
              className="text-xs"
            >
              {p}
              <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-[10px] font-semibold">
                {counts[p]}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Resultaten */}
      {!jobs ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered && filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Geen vacatures gevonden.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered?.map((job) => (
            <Card key={job._id} className="transition-colors hover:bg-accent/40">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-snug text-foreground line-clamp-1">
                      {job.title}
                    </h3>
                    {job.externalUrl && (
                      <a
                        href={job.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                    )}
                    {job.department && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {job.department}
                      </span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {job.type}
                      </span>
                    )}
                    {job.salary && (
                      <span className="font-medium text-foreground">{job.salary}</span>
                    )}
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.requirements.slice(0, 5).map((req) => (
                        <Badge key={req} variant="secondary" className="text-[10px] font-normal">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 5 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          +{job.requirements.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {job.platformSource && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px]",
                      job.platformSource.toLowerCase() === "striive" && "border-blue-300 text-blue-600",
                      job.platformSource.toLowerCase() === "opdrachtoverheid" && "border-orange-300 text-orange-600",
                      job.platformSource.toLowerCase() === "flextender" && "border-green-300 text-green-600",
                    )}
                  >
                    {job.platformSource}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
