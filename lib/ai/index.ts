/**
 * AI Engine - Main Entry Point
 *
 * Exports all AI functionality for the recruitment platform
 */

export { parseResume } from './resume-parser'
export { gradeResume } from './resume-grader'
export { matchCandidateToJob } from './cv-matcher'

export type {
  ResumeGrade,
  MatchResult,
  MatchLevel,
  RiskProfile,
  KnockOutCriterion,
  ScoringCriterion,
  KnockOutResult,
  ScoringResult,
} from './types'
