import { Router } from "express";
import { ClassController } from "../../controllers/classController.js";

const classRoutes = Router();
const classController = new ClassController();

classRoutes.get("/classes", classController.list);

export { classRoutes };
