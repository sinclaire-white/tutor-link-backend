import { prisma } from "../../lib/prisma";

// Creates a new record in the Category table
const createCategory = async (payload: { name: string; description?: string }) => {
  return await prisma.category.create({
    data: payload,
  });
};

// Fetches all categories, sorted by name alphabetically
const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

// Update an existing category
const updateCategory = async (id: string, payload: { name?: string; description?: string }) => {
  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

// Delete a category
const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: { id },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};