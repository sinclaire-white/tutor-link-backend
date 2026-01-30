import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import sendResponse from "../helpers/sendResponse";



// Logic for creating a category
const createCategory = async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);

  // Using helper to send a standard 201 Created response
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
};

// Logic for getting the category list
const getAllCategories = async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
};

export const CategoryController = {
  createCategory,
  getAllCategories,
};