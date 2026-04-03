import { prisma } from "../../lib/prisma";

type TransactionType = "income" | "expense";

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const createTransactionService = async (input: {
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  note?: string;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (!user.isActive) {
    throw createHttpError(400, "Cannot assign transaction to inactive user");
  }

  return prisma.transaction.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      note: input.note,
      userId: input.userId,
    },
  });
};

export const listTransactionsService = async (input: {
  userId?: string;
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.category
      ? {
          category: {
            contains: input.category,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(input.startDate || input.endDate
      ? {
          date: {
            ...(input.startDate ? { gte: input.startDate } : {}),
            ...(input.endDate ? { lte: input.endDate } : {}),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getTransactionByIdService = async (id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  return transaction;
};

export const updateTransactionService = async (
  id: string,
  input: {
    amount?: number;
    type?: TransactionType;
    category?: string;
    date?: Date;
    note?: string;
  },
) => {
  const existing = await prisma.transaction.findUnique({ where: { id } });

  if (!existing) {
    throw createHttpError(404, "Transaction not found");
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      note: input.note,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const deleteTransactionService = async (id: string) => {
  const existing = await prisma.transaction.findUnique({ where: { id } });

  if (!existing) {
    throw createHttpError(404, "Transaction not found");
  }

  await prisma.transaction.delete({ where: { id } });
};
