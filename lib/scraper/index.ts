// Dynamic import for cheerio to handle optional dependency
let cheerio: any = null

export interface ScrapedJob {
  title: string
  company: string
  location: string
  type: string // Full-time, Part-time, Contract
  description: string
  requirements: string[]
  salary?: string
  url: string
  platform: string
  postedDate?: string
}

export interface ScrapeConfig {
  platform: string
  baseUrl: string
  searchQuery: string
  selectors: {
    jobList: string
    title: string
    company: string
    location: string
    description: string
    link: string
  }
}

export async function scrapeJobs(config: ScrapeConfig): Promise<ScrapedJob[]> {
  try {
    // Load cheerio if not already loaded
    if (!cheerio) {
      cheerio = await import("cheerio")
    }

    const url = new URL(config.baseUrl)
    // Add search query as parameter if not already in baseUrl
    if (!url.search.includes(encodeURIComponent(config.searchQuery))) {
      url.searchParams.set("q", config.searchQuery)
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs from ${config.platform}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const jobs: ScrapedJob[] = []

    $(config.selectors.jobList).each((index: number, element: any) => {
      try {
        const $job = $(element)

        const title = $job.find(config.selectors.title).text().trim()
        const company = $job.find(config.selectors.company).text().trim()
        const location = $job.find(config.selectors.location).text().trim()
        const description = $job.find(config.selectors.description).text().trim()
        const linkElement = $job.find(config.selectors.link)
        const url = linkElement.attr("href") || ""

        // Only add job if it has essential fields
        if (title && company && location) {
          const job: ScrapedJob = {
            title,
            company,
            location,
            type: inferJobType(description),
            description,
            requirements: extractRequirements(description),
            url: normalizeUrl(url, config.baseUrl),
            platform: config.platform,
            salary: extractSalary(description),
          }

          jobs.push(job)
        }
      } catch (err) {
        console.error(`Error parsing job element at index ${index}:`, err)
      }
    })

    return jobs
  } catch (error) {
    console.error(`Scraper error for ${config.platform}:`, error)
    throw error
  }
}

export function inferJobType(description: string): string {
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes("full-time") || lowerDesc.includes("fulltime")) {
    return "Full-time"
  }
  if (lowerDesc.includes("part-time") || lowerDesc.includes("parttime")) {
    return "Part-time"
  }
  if (lowerDesc.includes("contract") || lowerDesc.includes("freelance")) {
    return "Contract"
  }
  if (lowerDesc.includes("internship") || lowerDesc.includes("intern")) {
    return "Internship"
  }

  return "Full-time" // Default
}

export function extractRequirements(description: string): string[] {
  const requirements: Set<string> = new Set()

  // Common programming languages, frameworks, and tools
  const keywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "go",
    "rust",
    "react",
    "vue",
    "angular",
    "node.js",
    "express",
    "fastapi",
    "django",
    "spring",
    "sql",
    "postgresql",
    "mongodb",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "rest api",
    "graphql",
    "testing",
    "agile",
  ]

  const lowerDesc = description.toLowerCase()

  keywords.forEach((keyword) => {
    if (lowerDesc.includes(keyword)) {
      requirements.add(capitalizeWord(keyword))
    }
  })

  return Array.from(requirements)
}

export function extractSalary(description: string): string | undefined {
  // Look for salary patterns like $50k, $50,000, $50-60k, €50k
  const salaryPattern = /[\$€£]\s*[\d,]+(?:k|K)?(?:\s*[-–]\s*[\$€£]?\s*[\d,]+(?:k|K)?)?/g
  const matches = description.match(salaryPattern)

  if (matches && matches.length > 0) {
    return matches[0]
  }

  return undefined
}

export function normalizeUrl(url: string, baseUrl: string): string {
  if (!url) return ""

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  if (url.startsWith("/")) {
    const base = new URL(baseUrl)
    return `${base.protocol}//${base.host}${url}`
  }

  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return ""
  }
}

function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
