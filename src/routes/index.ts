import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { studentRoutes } from "./v1/student.routes.js";
import { occurrenceRoutes } from "./v1/occurrence.routes.js";
import { dashboardRoutes } from "./v1/dashboard.routes.js";
import { pedagogicalRoutes } from "./v1/pedagogical.routes.js";
import { adminRoutes } from "./v1/admin.routes.js";
import { courseRoutes } from "./v1/course.routes.js";
import { classRoutes } from "./v1/class.routes.js";

const appRoutes = Router();

// Centralização e Versionamento de Escopos
appRoutes.use("/auth", authRoutes);
appRoutes.use("/students", studentRoutes);
appRoutes.use("/occurrences", occurrenceRoutes);
appRoutes.use("/dashboard", dashboardRoutes);
appRoutes.use("/pedagogical", pedagogicalRoutes);
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/courses", courseRoutes); 
appRoutes.use("/classes", classRoutes);


export { appRoutes };
