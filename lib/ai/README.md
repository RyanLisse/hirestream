# AI Recruitment Engine

Production-ready AI engine for resume parsing, grading, and CV-vacancy matching using Claude via Vercel AI SDK.

## Features

### 1. Resume Parser (`resume-parser.ts`)
- Extracts clean text from PDF and plain text resumes
- Uses `pdf-parse` for PDF processing
- Automatic text normalization and cleaning

### 2. Resume Grader (`resume-grader.ts`)
- AI-powered resume analysis using Claude
- Structured JSON output via Vercel AI SDK
- Scores: overall, skill match, relevance, quality, AI-content detection
- Works with or without job description
- Extracts: skills, experience, education, strengths, weaknesses

### 3. CV-Vacancy Matcher (`cv-matcher.ts`)
**Inspired by Dutch recruitment matching systems**

**Two-phase matching:**

#### Phase 1: Knock-Out Criteria (Pass/Fail)
- Hard requirements that candidates MUST meet
- If any required knock-out fails, candidate is rejected
- Examples: location, availability, critical skills

#### Phase 2: Scoring Criteria (1-5 stars, weighted)
- Soft requirements scored on 1-5 scale
- Each criterion has a weight (importance)
- Calculates weighted total score (0-100)
- Examples: technical depth, experience relevance, education

**Output:**
- Overall match level: excellent | strong | good | weak | rejected
- Risk profile: low | medium | high
- Detailed results for each criterion
- Summary and recommendations

## API Routes

### POST `/api/ai/grade-resume`
Upload and grade a resume

**Request:**
```typescript
// multipart/form-data
{
  resume: File, // PDF or TXT, max 10MB
  jobDescription?: string // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    resumeText: string, // Preview
    grade: ResumeGrade
  }
}
```

### POST `/api/ai/match`
Match candidate against job

**Request (JSON):**
```typescript
{
  resumeText: string,
  job: Job,
  knockOutCriteria?: KnockOutCriterion[], // Optional
  scoringCriteria?: ScoringCriterion[] // Optional
}
```

**Request (Form Data):**
```typescript
{
  resume: File,
  job: string, // JSON
  knockOutCriteria?: string, // JSON (optional)
  scoringCriteria?: string // JSON (optional)
}
```

**Response:**
```typescript
{
  success: true,
  data: MatchResult
}
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## Usage Examples

### Grade a Resume

```typescript
import { parseResume, gradeResume } from '@/lib/ai'

// Parse resume
const buffer = await file.arrayBuffer()
const resumeText = await parseResume(Buffer.from(buffer), file.type)

// Grade it
const grade = await gradeResume(resumeText, jobDescription)

console.log(grade.overallScore) // 0-100
console.log(grade.skills) // ['React', 'TypeScript', ...]
console.log(grade.aiContentScore) // 15 (low AI likelihood)
```

### Match Candidate to Job

```typescript
import { matchCandidateToJob } from '@/lib/ai'

const result = await matchCandidateToJob({
  resumeText,
  job: {
    id: 'j1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    requiredSkills: ['React', 'TypeScript', 'Next.js'],
    // ... other job fields
  },
  // Optional: Custom criteria
  knockOutCriteria: [
    { id: 'location', criterion: 'Can work in SF or relocate', required: true },
    { id: 'react', criterion: 'Has React experience', required: true },
  ],
  scoringCriteria: [
    { id: 'skills', criterion: 'Technical skills depth', weight: 35 },
    { id: 'experience', criterion: 'Relevant experience', weight: 30 },
    // ... more criteria
  ],
})

console.log(result.overallMatch) // 'excellent' | 'strong' | 'good' | 'weak' | 'rejected'
console.log(result.knockOutsPassed) // true/false
console.log(result.totalWeightedScore) // 0-100
console.log(result.riskProfile) // 'low' | 'medium' | 'high'
console.log(result.recommendations) // ['Schedule technical interview', ...]
```

## Architecture

```
lib/ai/
├── types.ts           # TypeScript interfaces
├── resume-parser.ts   # PDF/text parsing
├── resume-grader.ts   # AI resume grading
├── cv-matcher.ts      # CV-vacancy matching
└── index.ts           # Public exports

app/api/ai/
├── grade-resume/
│   └── route.ts       # Resume grading endpoint
└── match/
    └── route.ts       # CV matching endpoint
```

## Error Handling

All functions include comprehensive error handling:
- Missing API keys
- Invalid file types
- Empty content
- Parsing failures
- AI API errors

Errors are thrown with descriptive messages for debugging.

## Type Safety

Fully typed with TypeScript:
- Zod schemas for AI output validation
- Strict interface contracts
- Type exports for consumers

## Testing

To test the endpoints:

```bash
# Grade a resume
curl -X POST http://localhost:3000/api/ai/grade-resume \
  -F "resume=@resume.pdf" \
  -F "jobDescription=Senior Frontend Engineer position..."

# Match candidate to job
curl -X POST http://localhost:3000/api/ai/match \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "...",
    "job": {...}
  }'
```

## Production Considerations

1. **Rate Limiting**: Add rate limiting to API routes
2. **Caching**: Cache resume parses and grades
3. **File Storage**: Store uploaded resumes in S3/storage
4. **Database**: Persist results to database
5. **Monitoring**: Track API usage and costs
6. **Validation**: Add additional input validation
7. **Security**: Scan uploaded files for malware
8. **Performance**: Process large batches asynchronously

## License

Part of the v0-recruitment-dashboard project.
