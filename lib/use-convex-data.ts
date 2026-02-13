"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  candidates as mockCandidates,
  jobs as mockJobs,
  interviews as mockInterviews,
  messages as mockMessages,
} from "./data";
import type { Candidate, Job, Interview, Message } from "./data";

// Transform Convex candidate data to match the UI interface
function transformConvexCandidate(convexCandidate: any): Candidate {
  return {
    id: convexCandidate._id,
    name: convexCandidate.name,
    email: convexCandidate.email,
    role: convexCandidate.role || "Software Engineer", // default if not set
    avatar: convexCandidate.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase(),
    score: convexCandidate.aiScore || 0,
    skills: convexCandidate.skills || [],
    experience: convexCandidate.experienceYears
      ? `${convexCandidate.experienceYears} years`
      : "N/A",
    status: convexCandidate.status || "new",
    appliedDate: new Date(convexCandidate._creationTime).toISOString().split("T")[0],
    source: convexCandidate.source || "Unknown",
    resumeQuality: convexCandidate.aiContentScore || 0,
    skillMatch: Math.min(convexCandidate.aiScore || 0, 100),
    relevance: Math.min((convexCandidate.aiScore || 0) + 5, 100),
    location: convexCandidate.location || "Unknown",
    phone: convexCandidate.phone || "N/A",
    tags: [], // Add tags logic if needed
  };
}

export function useCandidates() {
  const convexCandidates = useQuery(api.candidates.list, {});

  // Return Convex data if available, else mock data
  if (convexCandidates !== undefined && convexCandidates.length > 0) {
    return convexCandidates.map(transformConvexCandidate);
  }

  return mockCandidates;
}

export function useJobs() {
  const convexJobs = useQuery(api.jobs.list, {});
  // For now, return mock jobs until jobs queries are implemented
  return mockJobs;
}

export function useInterviews() {
  // Return mock interviews until interviews queries are implemented
  return mockInterviews;
}

export function useMessages() {
  // Return mock messages until messages queries are implemented
  return mockMessages;
}

// Candidate search with filters
export function useCandidateSearch(search?: string, status?: string) {
  const convexCandidates = useQuery(
    api.candidates.list,
    search || status ? { search, status } : {}
  );

  if (convexCandidates !== undefined) {
    return convexCandidates.map(transformConvexCandidate);
  }

  // Fallback to mock data with client-side filtering
  return mockCandidates.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !status || c.status === status;
    return matchSearch && matchStatus;
  });
}
