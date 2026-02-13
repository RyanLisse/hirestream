"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Landmark,
  FileSearch,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformConfig {
  id: string;
  name: string;
  icon: typeof Building2;
  status: "active" | "paused";
  lastScraped?: Date;
  totalListings: number;
  lastRunCount?: number;
}

interface ScrapeResult {
  id: string;
  platform: string;
  timestamp: Date;
  listingsFound: number;
  newListings: number;
  duration: number; // milliseconds
  status: "success" | "error";
  error?: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "striive",
    name: "Striive",
    icon: Building2,
    status: "active",
    lastScraped: new Date(Date.now() - 3600000), // 1 hour ago
    totalListings: 1247,
    lastRunCount: 152,
  },
  {
    id: "opdrachtoverheid",
    name: "Opdrachtoverheid",
    icon: Landmark,
    status: "active",
    lastScraped: new Date(Date.now() - 7200000), // 2 hours ago
    totalListings: 834,
    lastRunCount: 89,
  },
  {
    id: "flextender",
    name: "Flextender",
    icon: FileSearch,
    status: "active",
    lastScraped: new Date(Date.now() - 5400000), // 1.5 hours ago
    totalListings: 623,
    lastRunCount: 67,
  },
];

const MOCK_RESULTS: ScrapeResult[] = [
  {
    id: "1",
    platform: "Striive",
    timestamp: new Date(Date.now() - 3600000),
    listingsFound: 152,
    newListings: 23,
    duration: 4500,
    status: "success",
  },
  {
    id: "2",
    platform: "Opdrachtoverheid",
    timestamp: new Date(Date.now() - 7200000),
    listingsFound: 89,
    newListings: 12,
    duration: 3800,
    status: "success",
  },
  {
    id: "3",
    platform: "Flextender",
    timestamp: new Date(Date.now() - 5400000),
    listingsFound: 67,
    newListings: 8,
    duration: 3200,
    status: "success",
  },
  {
    id: "4",
    platform: "Striive",
    timestamp: new Date(Date.now() - 86400000),
    listingsFound: 148,
    newListings: 19,
    duration: 4200,
    status: "success",
  },
  {
    id: "5",
    platform: "Opdrachtoverheid",
    timestamp: new Date(Date.now() - 93600000),
    listingsFound: 92,
    newListings: 15,
    duration: 3900,
    status: "success",
  },
];

export function ScraperDashboard() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(PLATFORMS);
  const [results, setResults] = useState<ScrapeResult[]>(MOCK_RESULTS);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const handleScrape = async (platformId: string) => {
    setLoadingPlatform(platformId);
    setError(null);

    try {
      const response = await fetch("/api/scraper/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to scrape: ${response.statusText}`);
      }

      const data = await response.json();

      // Update platform
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? {
                ...p,
                lastScraped: new Date(),
                totalListings: p.totalListings + (data.newListings || 0),
                lastRunCount: data.listingsFound || 0,
              }
            : p
        )
      );

      // Add result
      const newResult: ScrapeResult = {
        id: Date.now().toString(),
        platform: platforms.find((p) => p.id === platformId)?.name || platformId,
        timestamp: new Date(),
        listingsFound: data.listingsFound || 0,
        newListings: data.newListings || 0,
        duration: data.duration || 0,
        status: data.success ? "success" : "error",
        error: data.error,
      };

      setResults((prev) => [newResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Scrape error:", err);
    } finally {
      setLoadingPlatform(null);
    }
  };

  const totalListings = platforms.reduce((sum, p) => sum + p.totalListings, 0);
  const lastFullScrape = platforms.reduce((latest, p) => {
    if (!p.lastScraped) return latest;
    return !latest || p.lastScraped > latest ? p.lastScraped : latest;
  }, null as Date | null);
  const avgPerDay = Math.floor(totalListings / 30); // Rough estimate

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalListings}</p>
              <p className="text-xs text-muted-foreground">Total Listings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold text-card-foreground">
                {lastFullScrape ? formatTimeAgo(lastFullScrape) : "Never"}
              </p>
              <p className="text-xs text-muted-foreground">Last Full Scrape</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100/50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{avgPerDay}</p>
              <p className="text-xs text-muted-foreground">Avg per day</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isLoading = loadingPlatform === platform.id;

          return (
            <Card key={platform.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                      data-platform={platform.id}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      platform.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    <div
                      className={cn(
                        "mr-1.5 h-1.5 w-1.5 rounded-full",
                        platform.status === "active" ? "bg-green-600" : "bg-yellow-600"
                      )}
                    />
                    {platform.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last scraped:</span>
                    <span className="font-medium">
                      {platform.lastScraped ? formatTimeAgo(platform.lastScraped) : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total listings:</span>
                    <span className="font-bold text-primary">{platform.totalListings}</span>
                  </div>
                  {platform.lastRunCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last run:</span>
                      <span className="font-medium">{platform.lastRunCount} found</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleScrape(platform.id)}
                  disabled={isLoading || platform.status === "paused"}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" role="status" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scrape Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Scrape Results Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Scrape Results</CardTitle>
          <CardDescription>Latest scraping job execution results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Listings Found</TableHead>
                  <TableHead>New Listings</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.slice(0, 10).map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(result.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{result.platform}</TableCell>
                    <TableCell className="font-semibold">{result.listingsFound}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      +{result.newListings}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDuration(result.duration)}
                    </TableCell>
                    <TableCell>
                      {result.status === "success" ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
