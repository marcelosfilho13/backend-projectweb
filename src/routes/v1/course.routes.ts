import { Router } from "express";
import { CourseController } from "../../controllers/courseController.js";

const courseRoutes = Router();
const courseController = new CourseController();

courseRoutes.get("/", courseController.list);

export { courseRoutes };
