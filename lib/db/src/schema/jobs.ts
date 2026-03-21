import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  salaryMin: numeric("salary_min", { precision: 12, scale: 2 }),
  salaryMax: numeric("salary_max", { precision: 12, scale: 2 }),
  experienceLevel: text("experience_level").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  applicantCount: integer("applicant_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, applicantCount: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
