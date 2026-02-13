"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Shield, Lightbulb } from "lucide-react"

interface MatchReportProps {
  candidateName: string
  jobTitle: string
  overallScore: number
}

interface KnockOutCriterion {
  criterion: string
  required: boolean
  met: boolean
  evidence: string
}

interface ScoringCriterion {
  criterion: string
  weight: number
  score: number
  explanation: string
}

export function MatchReport({ candidateName, jobTitle, overallScore }: MatchReportProps) {
  // Mock data - in production this would come from the backend
  const knockOutCriteria: KnockOutCriterion[] = [
    {
      criterion: "Required Experience",
      required: true,
      met: true,
      evidence: "7 years of frontend development",
    },
    {
      criterion: "React Proficiency",
      required: true,
      met: true,
      evidence: "Expert-level React skills with 4+ projects",
    },
    {
      criterion: "TypeScript",
      required: true,
      met: true,
      evidence: "Advanced TypeScript experience",
    },
    {
      criterion: "Security Clearance",
      required: false,
      met: false,
      evidence: "Not mentioned in resume",
    },
  ]

  const scoringCriteria: ScoringCriterion[] = [
    {
      criterion: "Technical Skills Match",
      weight: 0.3,
      score: 5,
      explanation: "Perfect alignment with React, TypeScript, Next.js stack",
    },
    {
      criterion: "Experience Level",
      weight: 0.25,
      score: 4,
      explanation: "7 years experience slightly below 8-year requirement but highly qualified",
    },
    {
      criterion: "Problem Solving",
      weight: 0.2,
      score: 5,
      explanation: "Demonstrated strong system design and architecture skills",
    },
    {
      criterion: "Communication",
      weight: 0.15,
      score: 4,
      explanation: "Clear resume and professional background, minimal concerns",
    },
    {
      criterion: "Culture Fit",
      weight: 0.1,
      score: 4,
      explanation: "Startup experience aligns with company values",
    },
  ]

  const getOverallBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-accent" }
    if (score >= 80) return { label: "Strong", color: "bg-primary" }
    if (score >= 70) return { label: "Good", color: "bg-warning" }
    if (score >= 60) return { label: "Weak", color: "bg-destructive/80" }
    return { label: "Rejected", color: "bg-destructive" }
  }

  const badge = getOverallBadge(overallScore)
  const weightedScore = scoringCriteria.reduce((sum, c) => sum + c.score * c.weight, 0) * 10

  const riskLevel = overallScore >= 85 ? "Low" : overallScore >= 75 ? "Medium" : "High"
  const riskColor = overallScore >= 85 ? "text-accent" : overallScore >= 75 ? "text-warning" : "text-destructive"

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-card-foreground">CV-Vacancy Match Report</CardTitle>
              <CardDescription>
                Matching {candidateName} to {jobTitle}
              </CardDescription>
            </div>
            <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">Overall Match Score</span>
              <span className="text-2xl font-bold text-primary">{overallScore}%</span>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Knock-Out Criteria */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Knock-Out Criteria
          </CardTitle>
          <CardDescription>Must-have requirements for the role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold text-card-foreground">Criterion</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-card-foreground">Required</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-card-foreground">Met</TableHead>
                  <TableHead className="text-xs font-semibold text-card-foreground">Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knockOutCriteria.map((criterion) => (
                  <TableRow key={criterion.criterion} className="border-border">
                    <TableCell className="text-sm text-card-foreground">{criterion.criterion}</TableCell>
                    <TableCell className="text-center">
                      {criterion.required ? (
                        <Badge variant="outline" className="text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {criterion.met ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-accent" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{criterion.evidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Criteria */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Scoring Criteria
          </CardTitle>
          <CardDescription>Weighted evaluation components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold text-card-foreground">Criterion</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-card-foreground">Weight</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-card-foreground">Score</TableHead>
                  <TableHead className="text-xs font-semibold text-card-foreground">Explanation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoringCriteria.map((criterion) => (
                  <TableRow key={criterion.criterion} className="border-border">
                    <TableCell className="text-sm font-medium text-card-foreground">{criterion.criterion}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{(criterion.weight * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${star <= criterion.score ? "text-warning" : "text-muted-foreground/30"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{criterion.explanation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Weighted Score */}
          <div className="mt-4 rounded-lg bg-primary/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">Total Weighted Score</span>
              <span className="text-xl font-bold text-primary">{Math.round(weightedScore)}/100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4" /> Risk Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
            <span className="text-sm font-medium text-card-foreground">Overall Risk Level</span>
            <span className={`text-sm font-bold ${riskColor}`}>{riskLevel}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {overallScore >= 85
              ? "Minimal risk. Candidate is highly qualified with strong alignment to role requirements."
              : overallScore >= 75
              ? "Moderate risk. Candidate has most required skills but may need some training in specific areas."
              : "High risk. Consider additional assessments or further interviews before proceeding."}
          </p>
        </CardContent>
      </Card>

      {/* Summary & Recommendations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-accent" /> Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {overallScore >= 85 ? (
              <>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  Proceed to next round with confidence
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  Focus interview on culture fit and specific projects
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  Consider expedited hiring timeline
                </li>
              </>
            ) : overallScore >= 70 ? (
              <>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                  Schedule technical interview to assess specific gaps
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                  Consider training plan for identified skill gaps
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  Strong background with targeted development opportunities
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  Significant skill gaps identified
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                  Consider for different role or recommend further development
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                  May proceed only with structured onboarding plan
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
