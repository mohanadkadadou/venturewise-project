import { Router } from "express";
import { db } from "@workspace/db";
import { startupIdeasTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

function formatIdea(idea: typeof startupIdeasTable.$inferSelect) {
  return {
    ...idea,
    requiredBudget: Number(idea.requiredBudget),
    expectedReturn: Number(idea.expectedReturn),
    createdAt: idea.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const ideas = await db.select().from(startupIdeasTable).orderBy(desc(startupIdeasTable.createdAt));
    res.json(ideas.map(formatIdea));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch startup ideas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, category, requiredBudget, expectedReturn, riskLevel, stage } = req.body;

    if (!title || !description || !category || !requiredBudget || !expectedReturn || !riskLevel || !stage) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    const [idea] = await db.insert(startupIdeasTable).values({
      title,
      description,
      category,
      requiredBudget: String(requiredBudget),
      expectedReturn: String(expectedReturn),
      riskLevel,
      stage,
      isActive: true,
    }).returning();

    res.status(201).json(formatIdea(idea));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create startup idea" });
  }
});

export default router;
