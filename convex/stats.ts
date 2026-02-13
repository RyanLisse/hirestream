import { query } from "./_generated/server";

// Get comprehensive dashboard statistics
export const getDashboardStats = query({
  args: {},
  handler: async (ctx, args) => {
    // Fetch all data
    const candidates = await ctx.db.query("candidates").collect();
    const jobs = await ctx.db.query("jobs").collect();
    const applications = await ctx.db.query("applications").collect();
    const interviews = await ctx.db.query("interviews").collect();
    const messages = await ctx.db.query("messages").collect();
    const scraperConfigs = await ctx.db.query("scraperConfigs").collect();

    // Candidate stats
    const totalCandidates = candidates.length;
    const scoredCandidates = candidates.filter(
      c => c.aiScore !== undefined && c.aiScore !== null
    );
    const avgAiScore = scoredCandidates.length > 0
      ? scoredCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / scoredCandidates.length
      : 0;

    // Job stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === "active").length;
    const closedJobs = jobs.filter(j => j.status === "closed").length;

    // Application stats
    const totalApplications = applications.length;

    // Pipeline breakdown
    const pipelineStages = {
      new: candidates.filter(c => c.status === "new").length,
      screening: candidates.filter(c => c.status === "screening").length,
      interview: candidates.filter(c => c.status === "interview").length,
      offer: candidates.filter(c => c.status === "offer").length,
      hired: candidates.filter(c => c.status === "hired").length,
      rejected: candidates.filter(c => c.status === "rejected").length,
    };

    // Interview stats
    const totalInterviews = interviews.length;
    const upcomingInterviews = interviews.filter(i => i.status === "scheduled").length;
    const completedInterviews = interviews.filter(i => i.status === "completed").length;

    // Message stats
    const totalMessages = messages.length;
    const sentMessages = messages.filter(m => m.status === "sent").length;
    const avgOpenRate = sentMessages > 0
      ? messages
          .filter(m => m.status === "sent" && m.openRate !== undefined)
          .reduce((sum, m) => sum + (m.openRate || 0), 0) / sentMessages
      : 0;

    // Scraper stats
    const activeScrapers = scraperConfigs.filter(s => s.active).length;
    const totalScrapers = scraperConfigs.length;

    // Department breakdown
    const departmentStats = jobs.reduce((acc, job) => {
      const dept = job.department;
      if (!acc[dept]) {
        acc[dept] = {
          total: 0,
          active: 0,
          applications: 0,
        };
      }
      acc[dept].total++;
      if (job.status === "active") {
        acc[dept].active++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; applications: number }>);

    // Add application counts to department stats
    for (const app of applications) {
      const job = jobs.find(j => j._id === app.jobId);
      if (job && departmentStats[job.department]) {
        departmentStats[job.department].applications++;
      }
    }

    // Source breakdown
    const sourceStats = candidates.reduce((acc, candidate) => {
      const source = candidate.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity
    const recentCandidates = candidates
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .slice(0, 5)
      .map(c => ({
        id: c._id,
        name: c.name,
        status: c.status,
        aiScore: c.aiScore,
        createdAt: c._creationTime,
      }));

    const recentJobs = jobs
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .slice(0, 5)
      .map(j => ({
        id: j._id,
        title: j.title,
        department: j.department,
        status: j.status,
        createdAt: j._creationTime,
      }));

    return {
      // Overview
      totalCandidates,
      activeJobs,
      closedJobs,
      totalJobs,
      totalApplications,
      avgAiScore,
      scoredCandidatesCount: scoredCandidates.length,

      // Pipeline
      pipelineStages,

      // Interviews
      totalInterviews,
      upcomingInterviews,
      completedInterviews,

      // Messages
      totalMessages,
      sentMessages,
      avgOpenRate,

      // Scrapers
      activeScrapers,
      totalScrapers,

      // Breakdowns
      departmentStats,
      sourceStats,

      // Recent Activity
      recentCandidates,
      recentJobs,

      // Metadata
      lastUpdated: Date.now(),
    };
  },
});

// Get pipeline metrics for visualization
export const getPipelineMetrics = query({
  args: {},
  handler: async (ctx, args) => {
    const candidates = await ctx.db.query("candidates").collect();

    const stages = ["new", "screening", "interview", "offer", "hired", "rejected"];
    const metrics = stages.map(stage => {
      const count = candidates.filter(c => c.status === stage).length;
      const avgScore = candidates
        .filter(c => c.status === stage && c.aiScore !== undefined)
        .reduce((sum, c, _, arr) => sum + (c.aiScore || 0) / arr.length, 0);

      return {
        stage,
        count,
        avgScore: isNaN(avgScore) ? 0 : avgScore,
      };
    });

    return metrics;
  },
});

// Get department performance
export const getDepartmentPerformance = query({
  args: {},
  handler: async (ctx, args) => {
    const jobs = await ctx.db.query("jobs").collect();
    const applications = await ctx.db.query("applications").collect();
    const candidates = await ctx.db.query("candidates").collect();

    const departments = [...new Set(jobs.map(j => j.department))];

    const performance = departments.map(dept => {
      const deptJobs = jobs.filter(j => j.department === dept);
      const deptJobIds = deptJobs.map(j => j._id);
      const deptApplications = applications.filter(app =>
        deptJobIds.includes(app.jobId)
      );

      // Get unique candidates for this department
      const candidateIds = new Set(deptApplications.map(app => app.candidateId));
      const deptCandidates = candidates.filter(c => candidateIds.has(c._id));

      const avgScore = deptCandidates
        .filter(c => c.aiScore !== undefined)
        .reduce((sum, c, _, arr) => sum + (c.aiScore || 0) / arr.length, 0);

      const hiredCount = deptCandidates.filter(c => c.status === "hired").length;
      const conversionRate = deptCandidates.length > 0
        ? (hiredCount / deptCandidates.length) * 100
        : 0;

      return {
        department: dept,
        activeJobs: deptJobs.filter(j => j.status === "active").length,
        totalJobs: deptJobs.length,
        applications: deptApplications.length,
        candidates: deptCandidates.length,
        avgScore: isNaN(avgScore) ? 0 : avgScore,
        hiredCount,
        conversionRate,
      };
    });

    return performance;
  },
});
