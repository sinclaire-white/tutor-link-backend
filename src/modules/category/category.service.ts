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

export const CategoryService = {
  createCategory,
  getAllCategories,
};