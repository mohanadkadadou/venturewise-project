import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, applicationsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function formatJob(job: typeof jobsTable.$inferSelect) {
  return {
    ...job,
    salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
    salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
    createdAt: job.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const jobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true)).orderBy(desc(jobsTable.createdAt));
    res.json(jobs.map(formatJob));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch jobs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, company, location, type, category, description, requirements, salaryMin, salaryMax, experienceLevel } = req.body;

    if (!title || !company || !location || !type || !category || !description || !requirements || !experienceLevel) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    const [job] = await db.insert(jobsTable).values({
      title,
      company,
      location,
      type,
      category,
      description,
      requirements,
      salaryMin: salaryMin ? String(salaryMin) : null,
      salaryMax: salaryMax ? String(salaryMax) : null,
      experienceLevel,
      isActive: true,
      applicantCount: 0,
    }).returning();

    res.status(201).json(formatJob(job));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create job" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid ID" });

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
    if (!job) return res.status(404).json({ error: "not_found", message: "Job not found" });

    res.json(formatJob(job));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch job" });
  }
});

router.post("/:jobId/apply", async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ error: "bad_request", message: "Invalid job ID" });

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
    if (!job) return res.status(404).json({ error: "not_found", message: "Job not found" });

    const { applicantName, applicantEmail, skills, experience, cvText, coverLetter } = req.body;
    if (!applicantName || !applicantEmail || !skills || !experience || !cvText) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    const [application] = await db.insert(applicationsTable).values({
      jobId,
      applicantName,
      applicantEmail,
      skills,
      experience,
      cvText,
      coverLetter: coverLetter || null,
      status: "pending",
    }).returning();

    await db.update(jobsTable)
      .set({ applicantCount: sql`${jobsTable.applicantCount} + 1` })
      .where(eq(jobsTable.id, jobId));

    res.status(201).json({ ...application, createdAt: application.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to submit application" });
  }
});

router.get("/:jobId/applications", async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ error: "bad_request", message: "Invalid job ID" });

    const applications = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.jobId, jobId))
      .orderBy(desc(applicationsTable.createdAt));

    res.json(applications.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch applications" });
  }
});

export default router;
