/**
 * Database seed script for TalentAI recruitment platform
 * Generates realistic recruitment data including candidates, jobs, applications, interviews, messages, and scraper configs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Realistic candidate data
const candidates = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+31 6 12345678',
    location: 'Amsterdam, Netherlands',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    experience_years: 5,
    education: 'BSc Computer Science',
    ai_score: 8.5,
    ai_content_score: 8.7,
    status: 'screening' as const,
    source: 'LinkedIn',
  },
  {
    name: 'Bob Chen',
    email: 'bob.chen@email.com',
    phone: '+31 6 23456789',
    location: 'Rotterdam, Netherlands',
    skills: ['Python', 'Django', 'AWS', 'Docker'],
    experience_years: 7,
    education: 'BSc Software Engineering',
    ai_score: 8.2,
    ai_content_score: 8.4,
    status: 'interview' as const,
    source: 'Indeed',
  },
  {
    name: 'Claire Müller',
    email: 'claire.muller@email.com',
    phone: '+49 30 12345678',
    location: 'Berlin, Germany',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'UX Design'],
    experience_years: 4,
    education: 'BSc Web Development',
    ai_score: 7.8,
    ai_content_score: 7.9,
    status: 'new' as const,
    source: 'GitHub',
  },
  {
    name: 'David Larsson',
    email: 'david.larsson@email.com',
    phone: '+46 8 12345678',
    location: 'Stockholm, Sweden',
    skills: ['Go', 'Kubernetes', 'gRPC', 'Microservices'],
    experience_years: 8,
    education: 'MSc Computer Science',
    ai_score: 9.1,
    ai_content_score: 9.2,
    status: 'offer' as const,
    source: 'LinkedIn',
  },
  {
    name: 'Elena Rossi',
    email: 'elena.rossi@email.com',
    phone: '+39 6 12345678',
    location: 'Milan, Italy',
    skills: ['React', 'GraphQL', 'MongoDB', 'Jest'],
    experience_years: 6,
    education: 'BSc Information Technology',
    ai_score: 8.6,
    ai_content_score: 8.5,
    status: 'rejected' as const,
    source: 'Stack Overflow',
  },
  {
    name: 'François Dupont',
    email: 'francois.dupont@email.com',
    phone: '+33 1 12345678',
    location: 'Paris, France',
    skills: ['Java', 'Spring Boot', 'JUnit', 'Maven'],
    experience_years: 9,
    education: 'MSc Software Architecture',
    ai_score: 8.8,
    ai_content_score: 8.9,
    status: 'screening' as const,
    source: 'Indeed',
  },
  {
    name: 'Gabriela Silva',
    email: 'gabriela.silva@email.com',
    phone: '+55 11 98765432',
    location: 'São Paulo, Brazil',
    skills: ['AWS', 'Terraform', 'Lambda', 'CloudFormation'],
    experience_years: 5,
    education: 'BSc Systems Administration',
    ai_score: 8.3,
    ai_content_score: 8.2,
    status: 'new' as const,
    source: 'GitHub',
  },
  {
    name: 'Hans Weber',
    email: 'hans.weber@email.com',
    phone: '+43 1 12345678',
    location: 'Vienna, Austria',
    skills: ['C++', 'Embedded Systems', 'RTOS', 'CAN Bus'],
    experience_years: 10,
    education: 'MSc Electrical Engineering',
    ai_score: 8.9,
    ai_content_score: 9.0,
    status: 'interview' as const,
    source: 'LinkedIn',
  },
  {
    name: 'Isabel García',
    email: 'isabel.garcia@email.com',
    phone: '+34 91 12345678',
    location: 'Madrid, Spain',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Analysis'],
    experience_years: 4,
    education: 'MSc Data Science',
    ai_score: 8.7,
    ai_content_score: 8.8,
    status: 'screening' as const,
    source: 'LinkedIn',
  },
  {
    name: 'James Mitchell',
    email: 'james.mitchell@email.com',
    phone: '+44 20 12345678',
    location: 'London, UK',
    skills: ['Scala', 'Apache Spark', 'Data Engineering', 'SQL'],
    experience_years: 7,
    education: 'BSc Computer Science',
    ai_score: 8.5,
    ai_content_score: 8.6,
    status: 'offer' as const,
    source: 'Stack Overflow',
  },
  {
    name: 'Katerina Nikolaou',
    email: 'katerina.nikolaou@email.com',
    phone: '+30 21 12345678',
    location: 'Athens, Greece',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    experience_years: 3,
    education: 'BSc Web Development',
    ai_score: 7.9,
    ai_content_score: 8.0,
    status: 'new' as const,
    source: 'GitHub',
  },
  {
    name: 'Lena Kowalski',
    email: 'lena.kowalski@email.com',
    phone: '+48 22 12345678',
    location: 'Warsaw, Poland',
    skills: ['.NET', 'C#', 'Entity Framework', 'Azure'],
    experience_years: 6,
    education: 'BSc Software Development',
    ai_score: 8.4,
    ai_content_score: 8.3,
    status: 'screening' as const,
    source: 'Indeed',
  },
  // Add 38 more candidates for a total of 50
  ...Array.from({ length: 38 }, (_, i) => ({
    name: `Candidate ${i + 13}`,
    email: `candidate${i + 13}@email.com`,
    phone: `+31 6 ${String(i + 13).padStart(8, '0')}000`,
    location: 'Netherlands',
    skills: ['JavaScript', 'Python', 'SQL', 'Git'],
    experience_years: Math.floor(Math.random() * 15) + 1,
    education: 'BSc Computer Science',
    ai_score: Math.round((Math.random() * 2 + 6.5) * 10) / 10,
    ai_content_score: Math.round((Math.random() * 2 + 6.5) * 10) / 10,
    status: ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'][
      Math.floor(Math.random() * 6)
    ] as 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected',
    source: ['LinkedIn', 'Indeed', 'GitHub', 'Stack Overflow'][Math.floor(Math.random() * 4)],
  })),
]

// Job postings
const jobs = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Amsterdam, Netherlands',
    type: 'Full-time',
    description:
      'We are looking for an experienced Full-Stack Engineer to join our growing team. You will work on scalable web applications using modern technologies.',
    requirements: ['React', 'Node.js', 'PostgreSQL', '5+ years experience'],
    status: 'active' as const,
    platform_source: 'LinkedIn',
  },
  {
    title: 'Data Science Engineer',
    department: 'Data',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Join our Data team to build ML models and data pipelines. You will work with large datasets and cutting-edge ML frameworks.',
    requirements: ['Python', 'Machine Learning', 'SQL', 'Apache Spark'],
    status: 'active' as const,
    platform_source: 'Indeed',
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Berlin, Germany',
    type: 'Full-time',
    description: 'Manage and scale our cloud infrastructure. Experience with Kubernetes and AWS required.',
    requirements: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
    status: 'active' as const,
    platform_source: 'Stack Overflow',
  },
  {
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Amsterdam, Netherlands',
    type: 'Full-time',
    description: 'Build beautiful and responsive user interfaces. Strong focus on UX and performance.',
    requirements: ['React', 'TypeScript', 'CSS', 'UX Design'],
    status: 'active' as const,
    platform_source: 'GitHub',
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design and implement robust backend services. Experience with microservices architecture.',
    requirements: ['Java', 'Spring Boot', 'PostgreSQL', 'REST APIs'],
    status: 'paused' as const,
    platform_source: 'LinkedIn',
  },
  {
    title: 'QA Automation Engineer',
    department: 'Quality Assurance',
    location: 'Rotterdam, Netherlands',
    type: 'Full-time',
    description: 'Develop automated testing frameworks and ensure product quality.',
    requirements: ['Python', 'Selenium', 'Jest', 'CI/CD'],
    status: 'active' as const,
    platform_source: 'Indeed',
  },
  {
    title: 'Solutions Architect',
    department: 'Solutions',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Design solutions for enterprise clients. Work with cross-functional teams.',
    requirements: ['Cloud Architecture', 'System Design', '10+ years experience'],
    status: 'active' as const,
    platform_source: 'LinkedIn',
  },
  {
    title: 'Security Engineer',
    department: 'Security',
    location: 'Remote',
    type: 'Full-time',
    description: 'Protect our systems and data. Experience with security best practices and compliance.',
    requirements: ['Security Protocols', 'Penetration Testing', 'Cloud Security'],
    status: 'active' as const,
    platform_source: 'Stack Overflow',
  },
  {
    title: 'Mobile Developer',
    department: 'Engineering',
    location: 'Amsterdam, Netherlands',
    type: 'Full-time',
    description: 'Build native and cross-platform mobile applications.',
    requirements: ['React Native', 'Flutter', 'Mobile Development'],
    status: 'closed' as const,
    platform_source: 'GitHub',
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Berlin, Germany',
    type: 'Full-time',
    description: 'Lead product strategy and roadmap. Work with engineering and design teams.',
    requirements: ['Product Strategy', 'Data Analysis', 'Leadership'],
    status: 'active' as const,
    platform_source: 'LinkedIn',
  },
]

// Applications (link candidates to jobs)
function generateApplications(candidateIds: string[], jobIds: string[]) {
  const applications = []
  const stages = ['applied', 'screening', 'phone_interview', 'technical_test', 'final_interview']
  const statuses = ['applied', 'under_review', 'shortlisted', 'rejected', 'accepted']

  for (let i = 0; i < 30; i++) {
    const candidateId = candidateIds[Math.floor(Math.random() * candidateIds.length)]
    const jobId = jobIds[Math.floor(Math.random() * jobIds.length)]
    const stageIndex = Math.floor(Math.random() * stages.length)

    applications.push({
      candidate_id: candidateId,
      job_id: jobId,
      status: statuses[stageIndex],
      stage: stages[stageIndex],
      ai_match_score: Math.round(Math.random() * 100),
      knock_out_results: {},
      scoring_results: {},
      notes: `Application reviewed. Match score: ${Math.round(Math.random() * 100)}%`,
    })
  }
  return applications
}

// Interviews
function generateInterviews(applicationIds: string[]) {
  const interviews = []
  const interviewTypes = ['phone', 'video', 'onsite', 'technical'] as const
  const statuses = ['scheduled', 'completed', 'cancelled']

  for (let i = 0; i < 15; i++) {
    const applicationId = applicationIds[Math.floor(Math.random() * applicationIds.length)]
    const interviewType = interviewTypes[Math.floor(Math.random() * interviewTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const date = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)

    interviews.push({
      application_id: applicationId,
      candidate_name: `Candidate ${i + 1}`,
      role: 'Senior Engineer',
      type: interviewType,
      date: date.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      interviewer: ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)],
      status,
      feedback: status === 'completed' ? 'Strong technical skills and good communication.' : null,
      rating: status === 'completed' ? Math.floor(Math.random() * 5) + 1 : null,
    })
  }
  return interviews
}

// Messages
function generateMessages(applicationIds: string[]) {
  const templates = ['Welcome to TalentAI', 'Interview Scheduled', 'Offer Extended', 'Status Update']
  const messages = []

  for (let i = 0; i < 10; i++) {
    const applicationId = applicationIds[Math.floor(Math.random() * applicationIds.length)]
    const template = templates[Math.floor(Math.random() * templates.length)]
    const status = ['sent', 'draft', 'scheduled'][Math.floor(Math.random() * 3)]

    messages.push({
      application_id: applicationId,
      template,
      subject: template,
      body: `This is the body of the ${template} message.`,
      recipients: Math.floor(Math.random() * 100) + 1,
      status: status as 'sent' | 'draft' | 'scheduled',
      open_rate: status === 'sent' ? Math.round(Math.random() * 100) : null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
  }
  return messages
}

// Scraper configurations
const scraperConfigs = [
  {
    platform: 'Indeed',
    base_url: 'https://www.indeed.com',
    search_query: 'software engineer amsterdam',
    selectors: {
      job_title: '.jobTitle',
      company: '.companyName',
      location: '.companyLocation',
    },
    schedule: '0 0 * * *', // Daily at midnight
    active: true,
  },
  {
    platform: 'LinkedIn',
    base_url: 'https://www.linkedin.com/jobs',
    search_query: 'senior engineer remote',
    selectors: {
      job_title: '.job-card-title',
      company: '.job-card-container__company-name',
      location: '.job-card-container__metadata-item',
    },
    schedule: '0 2 * * *', // Daily at 2 AM
    active: true,
  },
  {
    platform: 'Government Jobs',
    base_url: 'https://www.government-jobs.com',
    search_query: 'technical roles europe',
    selectors: {
      job_title: '.job-title',
      company: '.agency-name',
      location: '.job-location',
    },
    schedule: '0 4 * * *', // Daily at 4 AM
    active: false,
  },
]

async function seedDatabase() {
  try {
    console.log('Starting database seed...')

    // Insert candidates
    console.log('Inserting candidates...')
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .insert(candidates)
      .select()

    if (candidatesError) {
      console.error('Error inserting candidates:', candidatesError)
      return
    }

    const candidateIds = candidatesData?.map((c) => c.id) || []
    console.log(`Inserted ${candidateIds.length} candidates`)

    // Insert jobs
    console.log('Inserting jobs...')
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .insert(jobs)
      .select()

    if (jobsError) {
      console.error('Error inserting jobs:', jobsError)
      return
    }

    const jobIds = jobsData?.map((j) => j.id) || []
    console.log(`Inserted ${jobIds.length} jobs`)

    // Insert applications
    console.log('Inserting applications...')
    const applications = generateApplications(candidateIds, jobIds)
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .insert(applications)
      .select()

    if (applicationsError) {
      console.error('Error inserting applications:', applicationsError)
      return
    }

    const applicationIds = applicationsData?.map((a) => a.id) || []
    console.log(`Inserted ${applicationIds.length} applications`)

    // Insert interviews
    console.log('Inserting interviews...')
    const interviews = generateInterviews(applicationIds)
    const { error: interviewsError } = await supabase.from('interviews').insert(interviews)

    if (interviewsError) {
      console.error('Error inserting interviews:', interviewsError)
      return
    }

    console.log(`Inserted ${interviews.length} interviews`)

    // Insert messages
    console.log('Inserting messages...')
    const messages = generateMessages(applicationIds)
    const { error: messagesError } = await supabase.from('messages').insert(messages)

    if (messagesError) {
      console.error('Error inserting messages:', messagesError)
      return
    }

    console.log(`Inserted ${messages.length} messages`)

    // Insert scraper configs
    console.log('Inserting scraper configs...')
    const { error: scrapersError } = await supabase
      .from('scrape_configs')
      .insert(scraperConfigs)

    if (scrapersError) {
      console.error('Error inserting scraper configs:', scrapersError)
      return
    }

    console.log(`Inserted ${scraperConfigs.length} scraper configs`)

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedDatabase()
