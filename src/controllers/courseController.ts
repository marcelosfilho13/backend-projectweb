import { Request, Response } from "express";
import { ListCoursesService } from "../services/listCoursesServices.js";

export class CourseController {
    async list(request: Request, response: Response) {
        const listCoursesService = new ListCoursesService();
        const courses = await listCoursesService.execute();
        return response.json(courses);
    }
}
