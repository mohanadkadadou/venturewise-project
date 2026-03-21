import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  successScore: integer("success_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  marketDemand: text("market_demand").notNull(),
  competitionLevel: text("competition_level").notNull(),
  estimatedRevenueMin: numeric("estimated_revenue_min", { precision: 15, scale: 2 }).notNull(),
  estimatedRevenueMax: numeric("estimated_revenue_max", { precision: 15, scale: 2 }).notNull(),
  explanation: text("explanation").notNull(),
  marketAnalysis: text("market_analysis").notNull(),
  pricingStrategy: text("pricing_strategy").notNull(),
  marketingPlan: text("marketing_plan").notNull(),
  brandingSuggestions: text("branding_suggestions").notNull(),
  productSuggestions: text("product_suggestions").notNull(),
  hiringNeeds: text("hiring_needs").notNull(),
  competitorsJson: text("competitors_json").notNull().default("[]"),
  subScoresJson: text("sub_scores_json").notNull().default("{}"),
  revenueProjectionJson: text("revenue_projection_json").notNull().default("[]"),
  marketBreakdownJson: text("market_breakdown_json").notNull().default("[]"),
  keyStrengthsJson: text("key_strengths_json").notNull().default("[]"),
  keyRisksJson: text("key_risks_json").notNull().default("[]"),
  breakEvenMonths: integer("break_even_months").notNull().default(12),
  roiPercent: numeric("roi_percent", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, createdAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
