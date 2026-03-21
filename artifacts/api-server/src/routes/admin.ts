import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, projectsTable, jobsTable, applicationsTable, startupIdeasTable, analysesTable } from "@workspace/db/schema";
import { desc, avg, count } from "drizzle-orm";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch users" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [projectCount] = await db.select({ count: count() }).from(projectsTable);
    const [jobCount] = await db.select({ count: count() }).from(jobsTable);
    const [applicationCount] = await db.select({ count: count() }).from(applicationsTable);
    const [ideaCount] = await db.select({ count: count() }).from(startupIdeasTable);
    const [userCount] = await db.select({ count: count() }).from(usersTable);
    const [avgScore] = await db.select({ avg: avg(analysesTable.successScore) }).from(analysesTable);

    res.json({
      totalProjects: projectCount.count,
      totalJobs: jobCount.count,
      totalApplications: applicationCount.count,
      totalStartupIdeas: ideaCount.count,
      totalUsers: userCount.count,
      avgSuccessScore: Number(avgScore.avg ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch stats" });
  }
});

export default router;
