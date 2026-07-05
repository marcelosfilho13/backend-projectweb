import {Router} from "express";
import { authRoutes } from "./auth.routes";
import { studentRoutes } from "./v1/student.routes";
import { occurrenceRoutes } from "./v1/occurrence.routes";
import { dashboardRoutes } from "./v1/dashboard.routes";
import { pedagogicalRoutes } from "./v1/pedagogical.routes";
import { adminRoutes } from "./v1/admin.routes";

const appRoutes = Router();

// Centralização e Versionamento de Escopos
appRoutes.use("/auth", authRoutes);
appRoutes.use("/students", studentRoutes);
appRoutes.use("/occurrences", occurrenceRoutes);
appRoutes.use("/dashboard", dashboardRoutes);
appRoutes.use("/pedagogical", pedagogicalRoutes);
appRoutes.use("/admin", adminRoutes)

export { appRoutes };