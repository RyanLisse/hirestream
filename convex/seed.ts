import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Seed the database with realistic recruitment data
 * Run this from the Convex dashboard or via CLI:
 * npx convex run seed:seedDatabase
 */
export const seedDatabase = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    candidates: number;
    jobs: number;
    applications: number;
    interviews: number;
    scrapers: number;
  }> => {
    console.log("🌱 Starting database seed...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // This is safe because we're using an internal action
    console.log("📝 Creating seed data...");

    // 1. Create Candidates
    const candidateNames = [
      { name: "Emma van der Berg", email: "emma.vandenberg@email.nl", location: "Amsterdam", skills: ["JavaScript", "React", "Node.js"], experience: 5, education: "BSc Computer Science - UvA" },
      { name: "Lukas Müller", email: "lukas.mueller@email.de", location: "Berlin", skills: ["Python", "Django", "PostgreSQL"], experience: 7, education: "MSc Software Engineering - TU Berlin" },
      { name: "Sophie Dubois", email: "sophie.dubois@email.fr", location: "Paris", skills: ["Java", "Spring Boot", "AWS"], experience: 4, education: "Engineering Degree - École Polytechnique" },
      { name: "Jan Kowalski", email: "jan.kowalski@email.pl", location: "Warsaw", skills: ["TypeScript", "Angular", "Azure"], experience: 6, education: "BSc IT - University of Warsaw" },
      { name: "Maria Garcia", email: "maria.garcia@email.es", location: "Barcelona", skills: ["React", "Vue.js", "GraphQL"], experience: 3, education: "BSc Computer Engineering - UPC" },
      { name: "Ahmed Hassan", email: "ahmed.hassan@email.com", location: "Rotterdam", skills: ["Python", "Machine Learning", "TensorFlow"], experience: 8, education: "PhD AI - TU Delft" },
      { name: "Yuki Tanaka", email: "yuki.tanaka@email.jp", location: "Tokyo", skills: ["Go", "Kubernetes", "Docker"], experience: 5, education: "BSc CS - University of Tokyo" },
      { name: "Lars Andersson", email: "lars.andersson@email.se", location: "Stockholm", skills: ["C#", ".NET", "Azure"], experience: 9, education: "MSc SE - KTH Royal Institute" },
      { name: "Isabella Rossi", email: "isabella.rossi@email.it", location: "Milan", skills: ["JavaScript", "React Native", "Firebase"], experience: 4, education: "BSc IT - Politecnico di Milano" },
      { name: "Tom de Vries", email: "tom.devries@email.nl", location: "Utrecht", skills: ["Java", "Spring", "Microservices"], experience: 6, education: "MSc CS - Utrecht University" },
      { name: "Anna Nowak", email: "anna.nowak@email.pl", location: "Krakow", skills: ["Python", "Flask", "MongoDB"], experience: 3, education: "BSc IT - Jagiellonian University" },
      { name: "Pierre Martin", email: "pierre.martin@email.fr", location: "Lyon", skills: ["PHP", "Laravel", "MySQL"], experience: 7, education: "Engineering - INSA Lyon" },
      { name: "Sarah O'Brien", email: "sarah.obrien@email.ie", location: "Dublin", skills: ["JavaScript", "Node.js", "Express"], experience: 5, education: "BSc CS - Trinity College Dublin" },
      { name: "Hans Schmidt", email: "hans.schmidt@email.de", location: "Munich", skills: ["Rust", "WebAssembly", "Linux"], experience: 10, education: "PhD CS - LMU Munich" },
      { name: "Fatima Al-Rashid", email: "fatima.alrashid@email.com", location: "Amsterdam", skills: ["React", "TypeScript", "Redux"], experience: 4, education: "MSc SE - VU Amsterdam" },
      { name: "Carlos Silva", email: "carlos.silva@email.pt", location: "Lisbon", skills: ["JavaScript", "Vue.js", "Nuxt"], experience: 5, education: "BSc IT - IST Lisbon" },
      { name: "Nina Petrov", email: "nina.petrov@email.ru", location: "Remote", skills: ["Python", "Data Science", "Pandas"], experience: 6, education: "MSc Mathematics - MSU" },
      { name: "Oliver Jensen", email: "oliver.jensen@email.dk", location: "Copenhagen", skills: ["Kotlin", "Android", "Jetpack"], experience: 4, education: "BSc CS - DTU" },
      { name: "Zara Khan", email: "zara.khan@email.uk", location: "London", skills: ["Swift", "iOS", "SwiftUI"], experience: 5, education: "BSc CS - Imperial College" },
      { name: "Marco Bianchi", email: "marco.bianchi@email.it", location: "Rome", skills: ["JavaScript", "React", "Next.js"], experience: 3, education: "BSc IT - La Sapienza" },
      { name: "Lena Johansson", email: "lena.johansson@email.se", location: "Gothenburg", skills: ["Python", "FastAPI", "PostgreSQL"], experience: 7, education: "MSc CS - Chalmers" },
      { name: "David Cohen", email: "david.cohen@email.com", location: "Tel Aviv", skills: ["Java", "Scala", "Spark"], experience: 8, education: "BSc CS - Technion" },
      { name: "Amelie Bernard", email: "amelie.bernard@email.fr", location: "Paris", skills: ["Ruby", "Rails", "Redis"], experience: 6, education: "Engineering - Centrale Paris" },
      { name: "Raj Patel", email: "raj.patel@email.in", location: "Bangalore", skills: ["JavaScript", "MERN Stack", "AWS"], experience: 5, education: "BTech CS - IIT Bombay" },
      { name: "Sofia Lopez", email: "sofia.lopez@email.es", location: "Madrid", skills: ["TypeScript", "Angular", "RxJS"], experience: 4, education: "BSc IT - UPM" },
    ];

    console.log(`Creating ${candidateNames.length} candidates...`);
    const candidateIds = [];
    for (const candidate of candidateNames) {
      const aiScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const aiContentScore = Math.floor(Math.random() * 40) + 55; // 55-95
      const statuses = ["new", "screening", "interview", "offer", "hired", "rejected"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const id = await ctx.runMutation(api.candidates.create, {
        name: candidate.name,
        email: candidate.email,
        phone: `+31 6 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
        location: candidate.location,
        resumeUrl: `https://storage.example.com/resumes/${candidate.email.split('@')[0]}.pdf`,
        resumeText: `Professional with ${candidate.experience} years of experience in ${candidate.skills.join(", ")}. ${candidate.education}.`,
        aiScore,
        aiContentScore,
        skills: candidate.skills,
        experienceYears: candidate.experience,
        education: candidate.education,
        source: Math.random() > 0.5 ? "LinkedIn" : Math.random() > 0.5 ? "Indeed" : "Direct Application",
        status,
      });
      candidateIds.push(id);
    }
    console.log(`✅ Created ${candidateIds.length} candidates`);

    // 2. Create Jobs
    const jobsData = [
      {
        title: "Senior Full Stack Developer",
        department: "Engineering",
        location: "Amsterdam",
        type: "full-time",
        description: "We're looking for a senior full-stack developer to join our growing team.",
        requirements: ["5+ years React/Node.js", "TypeScript expert", "Cloud experience (AWS/GCP)"],
        salary: "€70,000 - €90,000",
      },
      {
        title: "Frontend Engineer",
        department: "Engineering",
        location: "Remote",
        type: "full-time",
        description: "Build beautiful, performant user interfaces for our SaaS platform.",
        requirements: ["3+ years React", "CSS/Tailwind expert", "Testing experience"],
        salary: "€55,000 - €75,000",
      },
      {
        title: "Backend Engineer",
        department: "Engineering",
        location: "Berlin",
        type: "full-time",
        description: "Design and implement scalable backend services and APIs.",
        requirements: ["4+ years Python/Java", "Microservices architecture", "Database design"],
        salary: "€60,000 - €80,000",
      },
      {
        title: "DevOps Engineer",
        department: "Infrastructure",
        location: "Amsterdam",
        type: "full-time",
        description: "Manage our cloud infrastructure and CI/CD pipelines.",
        requirements: ["Kubernetes expert", "AWS/Azure certified", "Terraform/IaC"],
        salary: "€65,000 - €85,000",
      },
      {
        title: "Product Designer",
        department: "Design",
        location: "Remote",
        type: "full-time",
        description: "Create delightful user experiences for our products.",
        requirements: ["Portfolio required", "Figma expert", "User research experience"],
        salary: "€50,000 - €70,000",
      },
      {
        title: "Data Scientist",
        department: "Data",
        location: "Amsterdam",
        type: "full-time",
        description: "Build ML models to power our AI features.",
        requirements: ["Python/R expert", "ML/DL frameworks", "Statistics background"],
        salary: "€70,000 - €95,000",
      },
      {
        title: "Mobile Developer",
        department: "Engineering",
        location: "Remote",
        type: "contract",
        description: "Develop native iOS and Android applications.",
        requirements: ["Swift/Kotlin", "React Native or Flutter", "App Store experience"],
        salary: "€60,000 - €80,000",
      },
      {
        title: "QA Engineer",
        department: "Quality",
        location: "Amsterdam",
        type: "full-time",
        description: "Ensure product quality through automated testing.",
        requirements: ["Test automation", "Selenium/Cypress", "CI/CD integration"],
        salary: "€45,000 - €65,000",
      },
    ];

    console.log(`Creating ${jobsData.length} jobs...`);
    const jobIds = [];
    for (const job of jobsData) {
      const id = await ctx.runMutation(api.jobs.create, {
        ...job,
        knockOutCriteria: [
          { criterion: "Experience", description: "Minimum years required", required: true },
          { criterion: "Location", description: "Must be in Europe", required: true },
        ],
        scoringCriteria: [
          { criterion: "Technical Skills", weight: 0.4, description: "Proficiency in required technologies" },
          { criterion: "Experience", weight: 0.3, description: "Years of relevant experience" },
          { criterion: "Cultural Fit", weight: 0.3, description: "Alignment with company values" },
        ],
        status: Math.random() > 0.2 ? "active" : "paused",
      });
      jobIds.push(id);
    }
    console.log(`✅ Created ${jobIds.length} jobs`);

    // 3. Create Applications
    console.log("Creating applications...");
    const applicationIds = [];
    for (let i = 0; i < 20; i++) {
      const candidateId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
      const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];

      // Check if application already exists
      const existing = await ctx.runQuery(api.applications.findByCandidate, {
        candidateId,
        jobId,
      });

      if (!existing) {
        const stages = ["new", "screening", "interview", "offer", "hired", "rejected"];
        const stage = stages[Math.floor(Math.random() * stages.length)];
        const aiMatchScore = Math.floor(Math.random() * 40) + 60;

        const id = await ctx.runMutation(api.applications.create, {
          candidateId,
          jobId,
          status: "active",
          stage,
          aiMatchScore,
          knockOutResults: {
            experience: { passed: true, value: "5 years" },
            location: { passed: true, value: "Europe" },
          },
          scoringResults: {
            technicalSkills: { score: Math.random() * 40 + 60, weight: 0.4 },
            experience: { score: Math.random() * 40 + 60, weight: 0.3 },
            culturalFit: { score: Math.random() * 40 + 50, weight: 0.3 },
          },
          notes: "Automatically created during seed",
        });
        applicationIds.push(id);
      }
    }
    console.log(`✅ Created ${applicationIds.length} applications`);

    // 4. Create Interviews
    console.log("Creating interviews...");
    const interviewIds = [];
    for (let i = 0; i < 10; i++) {
      if (applicationIds.length > 0) {
        const applicationId = applicationIds[Math.floor(Math.random() * applicationIds.length)];
        const application = await ctx.runQuery(api.applications.getWithDetails, {
          id: applicationId,
        });

        if (application && application.candidate) {
          const types = ["phone", "video", "onsite", "technical"];
          const statuses = ["scheduled", "completed", "cancelled"];

          // Generate date (next 30 days)
          const daysAhead = Math.floor(Math.random() * 30);
          const date = new Date();
          date.setDate(date.getDate() + daysAhead);
          const dateStr = date.toISOString().split('T')[0];

          // Generate time
          const hour = Math.floor(Math.random() * 8) + 9; // 9-17
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;

          const id = await ctx.runMutation(api.interviews.create, {
            applicationId,
            candidateName: application.candidate.name,
            role: application.job?.title || "Unknown Role",
            type: types[Math.floor(Math.random() * types.length)],
            date: dateStr,
            time: timeStr,
            interviewer: `Interviewer ${Math.floor(Math.random() * 5) + 1}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
          });
          interviewIds.push(id);
        }
      }
    }
    console.log(`✅ Created ${interviewIds.length} interviews`);

    // 5. Create Scraper Configs
    const scraperConfigs = [
      {
        platform: "LinkedIn",
        baseUrl: "https://www.linkedin.com/jobs",
        searchQuery: "software engineer amsterdam",
        schedule: "daily",
        active: true,
      },
      {
        platform: "Indeed",
        baseUrl: "https://nl.indeed.com",
        searchQuery: "developer amsterdam",
        schedule: "daily",
        active: true,
      },
      {
        platform: "Glassdoor",
        baseUrl: "https://www.glassdoor.com/Job",
        searchQuery: "frontend engineer netherlands",
        schedule: "weekly",
        active: false,
      },
      {
        platform: "AngelList",
        baseUrl: "https://angel.co/jobs",
        searchQuery: "startup engineer europe",
        schedule: "weekly",
        active: true,
      },
      {
        platform: "RemoteOK",
        baseUrl: "https://remoteok.com/remote-dev-jobs",
        searchQuery: "remote",
        schedule: "daily",
        active: true,
      },
    ];

    console.log(`Creating ${scraperConfigs.length} scraper configs...`);
    const scraperIds = [];
    for (const config of scraperConfigs) {
      const id = await ctx.runMutation(api.scrapers.createConfig, {
        ...config,
        selectors: {
          jobTitle: ".job-title",
          company: ".company-name",
          location: ".job-location",
          description: ".job-description",
        },
      });
      scraperIds.push(id);
    }
    console.log(`✅ Created ${scraperIds.length} scraper configs`);

    // 6. Create some scrape results
    console.log("Creating scrape results...");
    for (let i = 0; i < 5; i++) {
      const configId = scraperIds[Math.floor(Math.random() * scraperIds.length)];
      await ctx.runMutation(api.scrapers.saveResult, {
        configId,
        jobsFound: Math.floor(Math.random() * 50) + 10,
        jobsNew: Math.floor(Math.random() * 10) + 1,
        errors: Math.random() > 0.7 ? "Some duplicates found" : undefined,
      });
    }
    console.log("✅ Created scrape results");

    // 7. Set up initial agent context
    console.log("Setting up agent context...");
    await ctx.runMutation(api.agentContext.set, {
      key: "system_initialized",
      value: new Date().toISOString(),
    });
    await ctx.runMutation(api.agentContext.set, {
      key: "seed_version",
      value: "1.0.0",
    });
    await ctx.runMutation(api.agentContext.set, {
      key: "platform_info",
      value: "HireStream - AI-Powered Recruitment Platform",
    });
    console.log("✅ Agent context initialized");

    console.log("\n🎉 Database seed completed successfully!");
    console.log(`
    Summary:
    - ${candidateIds.length} candidates
    - ${jobIds.length} jobs
    - ${applicationIds.length} applications
    - ${interviewIds.length} interviews
    - ${scraperIds.length} scraper configs
    `);

    return {
      success: true,
      candidates: candidateIds.length,
      jobs: jobIds.length,
      applications: applicationIds.length,
      interviews: interviewIds.length,
      scrapers: scraperIds.length,
    };
  },
});
