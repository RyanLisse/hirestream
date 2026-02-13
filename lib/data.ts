export interface Candidate {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  score: number
  skills: string[]
  experience: string
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected"
  appliedDate: string
  source: string
  resumeQuality: number
  skillMatch: number
  relevance: number
  location: string
  phone: string
  tags: string[]
}

export interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  applicants: number
  status: "active" | "paused" | "closed"
  postedDate: string
  requiredSkills: string[]
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  role: string
  date: string
  time: string
  type: "phone" | "video" | "onsite" | "technical"
  interviewer: string
  status: "scheduled" | "completed" | "cancelled"
  feedback?: string
  rating?: number
}

export interface Message {
  id: string
  subject: string
  recipients: number
  sentDate: string
  status: "sent" | "draft" | "scheduled"
  openRate?: number
  template: string
}

export const candidates: Candidate[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    role: "Senior Frontend Engineer",
    avatar: "SC",
    score: 94,
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "TailwindCSS"],
    experience: "7 years",
    status: "interview",
    appliedDate: "2026-02-08",
    source: "LinkedIn",
    resumeQuality: 96,
    skillMatch: 93,
    relevance: 92,
    location: "San Francisco, CA",
    phone: "+1 (415) 555-0142",
    tags: ["Top Candidate", "Senior"],
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    role: "Full Stack Developer",
    avatar: "MJ",
    score: 88,
    skills: ["Node.js", "React", "PostgreSQL", "AWS", "Docker"],
    experience: "5 years",
    status: "screening",
    appliedDate: "2026-02-10",
    source: "Referral",
    resumeQuality: 85,
    skillMatch: 90,
    relevance: 88,
    location: "Austin, TX",
    phone: "+1 (512) 555-0198",
    tags: ["Referral"],
  },
  {
    id: "c3",
    name: "Aisha Patel",
    email: "aisha.patel@email.com",
    role: "ML Engineer",
    avatar: "AP",
    score: 91,
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS SageMaker"],
    experience: "6 years",
    status: "offer",
    appliedDate: "2026-02-01",
    source: "Job Board",
    resumeQuality: 92,
    skillMatch: 89,
    relevance: 93,
    location: "Seattle, WA",
    phone: "+1 (206) 555-0167",
    tags: ["Top Candidate", "AI/ML"],
  },
  {
    id: "c4",
    name: "Daniel Kim",
    email: "daniel.k@email.com",
    role: "Backend Engineer",
    avatar: "DK",
    score: 76,
    skills: ["Go", "Kubernetes", "PostgreSQL", "Redis", "gRPC"],
    experience: "4 years",
    status: "new",
    appliedDate: "2026-02-12",
    source: "Career Page",
    resumeQuality: 78,
    skillMatch: 74,
    relevance: 76,
    location: "New York, NY",
    phone: "+1 (212) 555-0134",
    tags: ["Backend"],
  },
  {
    id: "c5",
    name: "Elena Rodriguez",
    email: "elena.r@email.com",
    role: "Product Designer",
    avatar: "ER",
    score: 85,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing"],
    experience: "5 years",
    status: "interview",
    appliedDate: "2026-02-06",
    source: "LinkedIn",
    resumeQuality: 88,
    skillMatch: 82,
    relevance: 86,
    location: "Los Angeles, CA",
    phone: "+1 (323) 555-0156",
    tags: ["Design"],
  },
  {
    id: "c6",
    name: "James Wright",
    email: "james.w@email.com",
    role: "DevOps Engineer",
    avatar: "JW",
    score: 82,
    skills: ["Terraform", "AWS", "CI/CD", "Docker", "Monitoring"],
    experience: "6 years",
    status: "screening",
    appliedDate: "2026-02-09",
    source: "Referral",
    resumeQuality: 80,
    skillMatch: 84,
    relevance: 81,
    location: "Denver, CO",
    phone: "+1 (303) 555-0123",
    tags: ["DevOps", "Cloud"],
  },
  {
    id: "c7",
    name: "Yuki Tanaka",
    email: "yuki.t@email.com",
    role: "Data Scientist",
    avatar: "YT",
    score: 89,
    skills: ["Python", "R", "SQL", "Tableau", "Machine Learning"],
    experience: "4 years",
    status: "hired",
    appliedDate: "2026-01-15",
    source: "Job Board",
    resumeQuality: 91,
    skillMatch: 88,
    relevance: 89,
    location: "Chicago, IL",
    phone: "+1 (312) 555-0178",
    tags: ["Data", "AI/ML"],
  },
  {
    id: "c8",
    name: "Olivia Brown",
    email: "olivia.b@email.com",
    role: "Senior Frontend Engineer",
    avatar: "OB",
    score: 71,
    skills: ["React", "JavaScript", "CSS", "HTML", "jQuery"],
    experience: "3 years",
    status: "rejected",
    appliedDate: "2026-02-05",
    source: "Career Page",
    resumeQuality: 65,
    skillMatch: 72,
    relevance: 75,
    location: "Portland, OR",
    phone: "+1 (503) 555-0145",
    tags: [],
  },
  {
    id: "c9",
    name: "Raj Gupta",
    email: "raj.g@email.com",
    role: "Cloud Architect",
    avatar: "RG",
    score: 93,
    skills: ["AWS", "Azure", "GCP", "Terraform", "Security"],
    experience: "9 years",
    status: "interview",
    appliedDate: "2026-02-07",
    source: "Headhunter",
    resumeQuality: 95,
    skillMatch: 91,
    relevance: 94,
    location: "Boston, MA",
    phone: "+1 (617) 555-0189",
    tags: ["Top Candidate", "Senior", "Cloud"],
  },
  {
    id: "c10",
    name: "Maria Gonzalez",
    email: "maria.g@email.com",
    role: "QA Engineer",
    avatar: "MG",
    score: 79,
    skills: ["Selenium", "Cypress", "Jest", "API Testing", "Agile"],
    experience: "4 years",
    status: "new",
    appliedDate: "2026-02-13",
    source: "LinkedIn",
    resumeQuality: 77,
    skillMatch: 80,
    relevance: 79,
    location: "Miami, FL",
    phone: "+1 (305) 555-0167",
    tags: ["QA"],
  },
]

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    applicants: 47,
    status: "active",
    postedDate: "2026-01-20",
    requiredSkills: ["React", "TypeScript", "Next.js"],
  },
  {
    id: "j2",
    title: "ML Engineer",
    department: "AI/ML",
    location: "Seattle, WA",
    type: "Full-time",
    applicants: 32,
    status: "active",
    postedDate: "2026-01-25",
    requiredSkills: ["Python", "TensorFlow", "MLOps"],
  },
  {
    id: "j3",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    applicants: 58,
    status: "active",
    postedDate: "2026-02-01",
    requiredSkills: ["Figma", "User Research", "Design Systems"],
  },
  {
    id: "j4",
    title: "Backend Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    applicants: 23,
    status: "active",
    postedDate: "2026-02-05",
    requiredSkills: ["Go", "PostgreSQL", "Kubernetes"],
  },
  {
    id: "j5",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Denver, CO",
    type: "Full-time",
    applicants: 19,
    status: "paused",
    postedDate: "2026-01-15",
    requiredSkills: ["Terraform", "AWS", "Docker"],
  },
  {
    id: "j6",
    title: "Data Scientist",
    department: "Analytics",
    location: "Chicago, IL",
    type: "Contract",
    applicants: 41,
    status: "closed",
    postedDate: "2025-12-10",
    requiredSkills: ["Python", "SQL", "Machine Learning"],
  },
]

export const interviews: Interview[] = [
  {
    id: "i1",
    candidateId: "c1",
    candidateName: "Sarah Chen",
    role: "Senior Frontend Engineer",
    date: "2026-02-14",
    time: "10:00 AM",
    type: "technical",
    interviewer: "Alex Turner",
    status: "scheduled",
  },
  {
    id: "i2",
    candidateId: "c5",
    candidateName: "Elena Rodriguez",
    role: "Product Designer",
    date: "2026-02-14",
    time: "2:00 PM",
    type: "video",
    interviewer: "Jessica Park",
    status: "scheduled",
  },
  {
    id: "i3",
    candidateId: "c9",
    candidateName: "Raj Gupta",
    role: "Cloud Architect",
    date: "2026-02-15",
    time: "11:00 AM",
    type: "onsite",
    interviewer: "Michael Ross",
    status: "scheduled",
  },
  {
    id: "i4",
    candidateId: "c3",
    candidateName: "Aisha Patel",
    role: "ML Engineer",
    date: "2026-02-10",
    time: "3:00 PM",
    type: "technical",
    interviewer: "David Liu",
    status: "completed",
    feedback: "Excellent problem-solving skills. Strong ML fundamentals and system design knowledge.",
    rating: 5,
  },
  {
    id: "i5",
    candidateId: "c7",
    candidateName: "Yuki Tanaka",
    role: "Data Scientist",
    date: "2026-02-08",
    time: "1:00 PM",
    type: "video",
    interviewer: "Sarah Kim",
    status: "completed",
    feedback: "Great analytical thinking. Good cultural fit. Offered position.",
    rating: 4,
  },
  {
    id: "i6",
    candidateId: "c2",
    candidateName: "Marcus Johnson",
    role: "Full Stack Developer",
    date: "2026-02-16",
    time: "9:30 AM",
    type: "phone",
    interviewer: "Chris Wang",
    status: "scheduled",
  },
]

export const messages: Message[] = [
  {
    id: "m1",
    subject: "Interview Confirmation - Senior Frontend Engineer",
    recipients: 3,
    sentDate: "2026-02-12",
    status: "sent",
    openRate: 100,
    template: "Interview Confirmation",
  },
  {
    id: "m2",
    subject: "Application Received - Thank You",
    recipients: 15,
    sentDate: "2026-02-11",
    status: "sent",
    openRate: 87,
    template: "Application Acknowledgment",
  },
  {
    id: "m3",
    subject: "Next Steps in Your Application",
    recipients: 8,
    sentDate: "2026-02-10",
    status: "sent",
    openRate: 92,
    template: "Status Update",
  },
  {
    id: "m4",
    subject: "Welcome to the Team!",
    recipients: 1,
    sentDate: "2026-02-09",
    status: "sent",
    openRate: 100,
    template: "Offer Acceptance",
  },
  {
    id: "m5",
    subject: "Bulk Outreach - Q1 Engineering Roles",
    recipients: 50,
    sentDate: "",
    status: "draft",
    template: "Talent Outreach",
  },
  {
    id: "m6",
    subject: "Reminder: Submit Feedback",
    recipients: 5,
    sentDate: "2026-02-14",
    status: "scheduled",
    template: "Interviewer Reminder",
  },
]

export const pipelineStages = [
  { name: "New", count: 24, color: "bg-muted-foreground" },
  { name: "Screening", count: 18, color: "bg-primary" },
  { name: "Interview", count: 12, color: "bg-warning" },
  { name: "Offer", count: 5, color: "bg-accent" },
  { name: "Hired", count: 3, color: "bg-success" },
]
