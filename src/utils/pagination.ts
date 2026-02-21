import { prisma } from "../lib/prisma";


export type PaginatedResult<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

type PaginationOptions = {
  page?: number;
  perPage?: number;
  orderBy?: any;
};

export const paginate = async <T>(
  model: any,
  where: any = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const perPage = Math.min(100, Math.max(1, options.perPage || 10));

  const [data, total] = await prisma.$transaction([
    model.findMany({
      where,
      orderBy: options.orderBy || { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    model.count({ where }),
  ]);

  return {
    items: data,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};