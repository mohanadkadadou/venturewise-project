import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import categoriesRouter from "./categories";
import jobsRouter from "./jobs";
import startupIdeasRouter from "./startup-ideas";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/categories", categoriesRouter);
router.use("/jobs", jobsRouter);
router.use("/startup-ideas", startupIdeasRouter);
router.use("/admin", adminRouter);

export default router;
