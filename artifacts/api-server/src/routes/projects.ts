import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, analysesTable, insertProjectSchema } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { analyzeProject } from "../services/analysis";

const router = Router();

function formatAnalysis(analysis: typeof analysesTable.$inferSelect) {
  return {
    ...analysis,
    estimatedRevenueMin: Number(analysis.estimatedRevenueMin),
    estimatedRevenueMax: Number(analysis.estimatedRevenueMax),
    roiPercent: Number(analysis.roiPercent),
    competitors: JSON.parse(analysis.competitorsJson),
    subScores: JSON.parse(analysis.subScoresJson),
    revenueProjection: JSON.parse(analysis.revenueProjectionJson),
    marketBreakdown: JSON.parse(analysis.marketBreakdownJson),
    keyStrengths: JSON.parse(analysis.keyStrengthsJson),
    keyRisks: JSON.parse(analysis.keyRisksJson),
    createdAt: analysis.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
    const result = projects.map((p) => ({
      ...p,
      budget: Number(p.budget),
      createdAt: p.createdAt.toISOString(),
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch projects" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertProjectSchema.safeParse({
      name: req.body.name,
      ownerName: req.body.ownerName,
      ownerEmail: req.body.ownerEmail,
      businessType: req.body.businessType,
      category: req.body.category,
      location: req.body.location,
      citySize: req.body.citySize,
      budget: String(req.body.budget),
      targetMarket: req.body.targetMarket,
      description: req.body.description,
    });

    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const [project] = await db.insert(projectsTable).values(parsed.data).returning();

    await new Promise((resolve) => setTimeout(resolve, 4000 + Math.random() * 2000));

    const analysisResult = analyzeProject({
      name: project.name,
      businessType: project.businessType,
      category: project.category,
      location: project.location,
      citySize: project.citySize,
      budget: Number(project.budget),
      targetMarket: project.targetMarket,
      description: project.description,
    });

    const [analysis] = await db.insert(analysesTable).values({
      projectId: project.id,
      successScore: analysisResult.successScore,
      riskLevel: analysisResult.riskLevel,
      marketDemand: analysisResult.marketDemand,
      competitionLevel: analysisResult.competitionLevel,
      estimatedRevenueMin: String(analysisResult.estimatedRevenueMin),
      estimatedRevenueMax: String(analysisResult.estimatedRevenueMax),
      explanation: analysisResult.explanation,
      marketAnalysis: analysisResult.marketAnalysis,
      pricingStrategy: analysisResult.pricingStrategy,
      marketingPlan: analysisResult.marketingPlan,
      brandingSuggestions: analysisResult.brandingSuggestions,
      productSuggestions: analysisResult.productSuggestions,
      hiringNeeds: analysisResult.hiringNeeds,
      competitorsJson: JSON.stringify(analysisResult.competitors),
      subScoresJson: JSON.stringify(analysisResult.subScores),
      revenueProjectionJson: JSON.stringify(analysisResult.revenueProjection),
      marketBreakdownJson: JSON.stringify(analysisResult.marketBreakdown),
      keyStrengthsJson: JSON.stringify(analysisResult.keyStrengths),
      keyRisksJson: JSON.stringify(analysisResult.keyRisks),
      breakEvenMonths: analysisResult.breakEvenMonths,
      roiPercent: String(analysisResult.roiPercent),
    }).returning();

    res.status(201).json({
      project: { ...project, budget: Number(project.budget), createdAt: project.createdAt.toISOString() },
      analysis: formatAnalysis(analysis),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to create project" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid ID" });

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "not_found", message: "Project not found" });

    const [analysis] = await db.select().from(analysesTable).where(eq(analysesTable.projectId, id));
    if (!analysis) return res.status(404).json({ error: "not_found", message: "Analysis not found" });

    res.json({
      project: { ...project, budget: Number(project.budget), createdAt: project.createdAt.toISOString() },
      analysis: formatAnalysis(analysis),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid ID" });

    const [deleted] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "not_found", message: "Project not found" });

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "internal_error", message: "Failed to delete project" });
  }
});

export default router;
