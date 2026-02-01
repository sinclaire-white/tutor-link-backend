import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import sendResponse from "../../utils/sendResponse";



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

// Logic for updating a category
const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params; // Get ID from URL
  const result = await CategoryService.updateCategory(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
};

// Logic for deleting a category
const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await CategoryService.deleteCategory(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: null, // No data to return after deletion
  });
};


export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};