import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";


// Internal helper to find a category or throw a 404
const findCategoryOrThrow = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, "Category not found");
  return category;
};;

// Creates a new record in the Category table
const createCategory = async (payload: ICreateCategoryPayload) => {
  // Check duplicate name
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  
  if (isExist) throw new AppError(400, "Category already exists");

  return await prisma.category.create({ data: payload });
};

// Fetches all categories, sorted by name alphabetically
const getAllCategories = async () => {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
};

// Updates an existing category after ensuring it exists
const updateCategory = async (
  id: string,
  payload: IUpdateCategoryPayload
) => {
  await findCategoryOrThrow(id);
  
  return await prisma.category.update({ 
    where: { id }, 
    data: payload 
  });
};;

// Deletes a category after ensuring it exists
const deleteCategory = async (id: string) => {
  await findCategoryOrThrow(id);
  return await prisma.category.delete({ where: { id } });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
