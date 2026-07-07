import { Request, Response } from "express";
import { ListClassesService } from "../services/listClassesServices.js";

export class ClassController {
    async list(request: Request, response: Response) {
        const listClassesService = new ListClassesService();
        const classes = await listClassesService.execute();
        return response.json(classes);
    }
}