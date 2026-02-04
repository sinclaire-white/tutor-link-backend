import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { IUpdateCategoryPayload } from "./category.interface";

// for creating a category wrapped in catchAsync to handle errors globally
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

// for getting the category list
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

// for updating a category
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.updateCategory(
    id as string,
    req.body as IUpdateCategoryPayload
  );


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

// for deleting a category
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CategoryService.deleteCategory(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: null, // no data to return on deletion
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
