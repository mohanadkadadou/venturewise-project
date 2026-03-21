import { pgTable, text, serial, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const startupIdeasTable = pgTable("startup_ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  requiredBudget: numeric("required_budget", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: numeric("expected_return", { precision: 15, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(),
  stage: text("stage").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStartupIdeaSchema = createInsertSchema(startupIdeasTable).omit({ id: true, createdAt: true });
export type InsertStartupIdea = z.infer<typeof insertStartupIdeaSchema>;
export type StartupIdea = typeof startupIdeasTable.$inferSelect;
