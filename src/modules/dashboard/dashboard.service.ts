import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

type SummaryInput = {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  months?: number;
};

type MonthlyTrendRow = {
  month: Date;
  type: "income" | "expense";
  total: number;
};

export const getDashboardSummaryService = async (input: SummaryInput) => {
  const months = input.months ?? 6;
  const trendFromDate = new Date();
  trendFromDate.setMonth(trendFromDate.getMonth() - (months - 1));
  trendFromDate.setDate(1);
  trendFromDate.setHours(0, 0, 0, 0);

  const baseWhere = {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.startDate || input.endDate
      ? {
          date: {
            ...(input.startDate ? { gte: input.startDate } : {}),
            ...(input.endDate ? { lte: input.endDate } : {}),
          },
        }
      : {}),
  };

  const userClause = input.userId
    ? Prisma.sql`AND "userId" = ${input.userId}`
    : Prisma.empty;
  const startDateClause = input.startDate
    ? Prisma.sql`AND "date" >= ${input.startDate}`
    : Prisma.empty;
  const endDateClause = input.endDate
    ? Prisma.sql`AND "date" <= ${input.endDate}`
    : Prisma.empty;

  const [incomeAgg, expenseAgg, categoryTotals, recentTransactions, trendRows] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          type: "income",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          type: "expense",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["category"],
        where: baseWhere,
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      }),
      prisma.transaction.findMany({
        where: baseWhere,
        orderBy: { date: "desc" },
        take: 5,
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
      prisma.$queryRaw<MonthlyTrendRow[]>`
          SELECT
            date_trunc('month', "date")::date AS month,
            type,
            SUM(amount)::float8 AS total
          FROM "Transaction"
          WHERE "date" >= ${trendFromDate}
            ${userClause}
            ${startDateClause}
            ${endDateClause}
          GROUP BY month, type
          ORDER BY month ASC;
        `,
    ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const netBalance = totalIncome - totalExpenses;

  const monthlyMap = new Map<
    string,
    { month: string; income: number; expense: number; net: number }
  >();

  for (const row of trendRows) {
    const monthKey = new Date(row.month).toISOString().slice(0, 7);

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const monthData = monthlyMap.get(monthKey);
    if (!monthData) continue;

    if (row.type === "income") {
      monthData.income = Number(row.total);
    } else {
      monthData.expense = Number(row.total);
    }

    monthData.net = monthData.income - monthData.expense;
  }

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netBalance,
    },
    categoryTotals: categoryTotals.map((item) => ({
      category: item.category,
      totalAmount: item._sum.amount ?? 0,
      transactionCount: item._count._all,
    })),
    recentTransactions,
    monthlyTrends: Array.from(monthlyMap.values()),
  };
};
