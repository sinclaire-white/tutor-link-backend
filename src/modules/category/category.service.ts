import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const findCategoryOrThrow = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, "Category not found");
  return category;
};

const createCategory = async (payload: ICreateCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (isExist) throw new AppError(400, "Category already exists");

  return await prisma.category.create({ data: payload });
};

// Returns all categories sorted by booking popularity (most booked first)
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { bookings: true } } },
  });
  return categories.sort((a, b) => b._count.bookings - a._count.bookings);
};

const updateCategory = async (
  id: string,
  payload: IUpdateCategoryPayload
) => {
  await findCategoryOrThrow(id);
  return await prisma.category.update({ where: { id }, data: payload });
};

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
