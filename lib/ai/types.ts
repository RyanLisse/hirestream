/**
 * AI Engine Type Definitions
 *
 * Shared types for resume parsing, grading, and CV-vacancy matching
 */

export interface ResumeGrade {
  overallScore: number // 0-100
  skillMatch: number // 0-100
  relevance: number // 0-100
  resumeQuality: number // 0-100
  aiContentScore: number // 0-100 (likelihood resume is AI-generated)
  skills: string[]
  experienceYears: number
  education: string
  summary: string
  strengths: string[]
  weaknesses: string[]
}

export interface KnockOutCriterion {
  id: string
  criterion: string
  required: boolean
}

export interface ScoringCriterion {
  id: string
  criterion: string
  weight: number
}

export interface KnockOutResult {
  criterion: string
  required: boolean
  met: boolean
  evidence: string
}

export interface ScoringResult {
  criterion: string
  weight: number
  score: number // 1-5
  explanation: string
}

export type MatchLevel = 'excellent' | 'strong' | 'good' | 'weak' | 'rejected'
export type RiskProfile = 'low' | 'medium' | 'high'

export interface MatchResult {
  overallMatch: MatchLevel
  knockOutsPassed: boolean
  knockOutResults: KnockOutResult[]
  scoringResults: ScoringResult[]
  totalWeightedScore: number
  summary: string
  riskProfile: RiskProfile
  recommendations: string[]
}
