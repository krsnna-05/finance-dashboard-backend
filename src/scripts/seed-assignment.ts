import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  TransactionType,
} from "../../generated/prisma/client";

type UserSeed = {
  email: string;
  role: Role;
  isActive: boolean;
};

type CategoryConfig = {
  name: string;
  min: number;
  max: number;
};

const databaseUrl = process.env.DATABASE_URL;
const defaultPassword = process.env.SEED_USER_PASSWORD ?? "Test@12345";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const seededUsers: UserSeed[] = [
  { email: "admin@finance.local", role: "ADMIN", isActive: true },
  { email: "admin.ops@finance.local", role: "ADMIN", isActive: true },
  { email: "analyst.revenue@finance.local", role: "ANALYST", isActive: true },
  { email: "analyst.ops@finance.local", role: "ANALYST", isActive: true },
  { email: "analyst.risk@finance.local", role: "ANALYST", isActive: true },
  { email: "analyst.inactive@finance.local", role: "ANALYST", isActive: false },
  { email: "viewer.ceo@finance.local", role: "VIEWER", isActive: true },
  { email: "viewer.audit@finance.local", role: "VIEWER", isActive: true },
  { email: "viewer.finance@finance.local", role: "VIEWER", isActive: true },
  { email: "viewer.guest@finance.local", role: "VIEWER", isActive: true },
  { email: "viewer.archived@finance.local", role: "VIEWER", isActive: false },
];

const incomeCategories: CategoryConfig[] = [
  { name: "Salary", min: 2500, max: 7200 },
  { name: "Freelance", min: 300, max: 2400 },
  { name: "Consulting", min: 700, max: 4300 },
  { name: "Investments", min: 150, max: 1900 },
  { name: "Bonus", min: 300, max: 3100 },
  { name: "Interest", min: 20, max: 250 },
];

const expenseCategories: CategoryConfig[] = [
  { name: "Rent", min: 700, max: 2800 },
  { name: "Groceries", min: 80, max: 480 },
  { name: "Utilities", min: 50, max: 320 },
  { name: "Transport", min: 30, max: 260 },
  { name: "Healthcare", min: 40, max: 700 },
  { name: "Insurance", min: 90, max: 500 },
  { name: "Entertainment", min: 20, max: 240 },
  { name: "Dining", min: 25, max: 220 },
  { name: "Shopping", min: 30, max: 550 },
  { name: "Education", min: 60, max: 900 },
  { name: "Travel", min: 120, max: 1400 },
  { name: "Subscriptions", min: 5, max: 90 },
];

const noteTemplates = {
  income: [
    "Monthly recurring income",
    "Client payment settled",
    "Quarterly performance bonus",
    "Dividend credited",
    "Contract completion payout",
  ],
  expense: [
    "Auto-debited recurring payment",
    "Paid via online transfer",
    "Team expense reimbursement",
    "One-time purchase",
    "Budgeted household cost",
  ],
};

const hashPassword = async (password: string) => bcrypt.hash(password, 12);

const round2 = (value: number) => Math.round(value * 100) / 100;

const makeRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const randomBetween = (rng: () => number, min: number, max: number) =>
  min + rng() * (max - min);

const pick = <T>(rng: () => number, list: T[]): T =>
  list[Math.floor(rng() * list.length)] as T;

const getMonthStart = (monthsAgo: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  date.setMonth(date.getMonth() - monthsAgo);
  return date;
};

const randomDateInMonth = (rng: () => number, monthStart: Date) => {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const maxDay = new Date(year, month + 1, 0).getDate();
  const day = randomInt(rng, 1, maxDay);
  const hour = randomInt(rng, 7, 22);
  const minute = randomInt(rng, 0, 59);
  const second = randomInt(rng, 0, 59);
  return new Date(year, month, day, hour, minute, second, 0);
};

const makeTransactionAmount = (
  rng: () => number,
  config: CategoryConfig,
  monthOffset: number,
  type: TransactionType,
) => {
  let amount = randomBetween(rng, config.min, config.max);

  if (type === "income" && monthOffset % 3 === 0) {
    amount *= 1.08;
  }

  if (type === "expense" && monthOffset % 4 === 0) {
    amount *= 1.05;
  }

  return round2(amount);
};

const shouldGenerateTx = (role: Role, isActive: boolean) =>
  role !== "VIEWER" || !isActive;

const createAssignmentSeed = async () => {
  const hashedPassword = await hashPassword(defaultPassword);
  const userMap = new Map<
    string,
    { id: string; role: Role; isActive: boolean }
  >();

  for (const user of seededUsers) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    userMap.set(upserted.email, {
      id: upserted.id,
      role: upserted.role,
      isActive: upserted.isActive,
    });
  }

  const seededUserIds = Array.from(userMap.values()).map((u) => u.id);

  await prisma.transaction.deleteMany({
    where: {
      userId: {
        in: seededUserIds,
      },
    },
  });

  const transactionData: {
    amount: number;
    type: TransactionType;
    category: string;
    date: Date;
    note: string;
    userId: string;
  }[] = [];

  for (const [index, user] of Array.from(userMap.values()).entries()) {
    if (!shouldGenerateTx(user.role, user.isActive)) {
      continue;
    }

    const rng = makeRng(1000 + index * 17);
    const monthsToGenerate = 14;

    for (
      let monthOffset = 0;
      monthOffset < monthsToGenerate;
      monthOffset += 1
    ) {
      const monthStart = getMonthStart(monthOffset);

      const incomeCount =
        user.role === "ADMIN" ? randomInt(rng, 3, 6) : randomInt(rng, 2, 5);
      const expenseCount =
        user.role === "ADMIN" ? randomInt(rng, 7, 11) : randomInt(rng, 6, 10);

      for (let i = 0; i < incomeCount; i += 1) {
        const category = pick(rng, incomeCategories);
        const amount = makeTransactionAmount(
          rng,
          category,
          monthOffset,
          "income",
        );

        transactionData.push({
          amount,
          type: "income",
          category: category.name,
          date: randomDateInMonth(rng, monthStart),
          note: pick(rng, noteTemplates.income),
          userId: user.id,
        });
      }

      for (let i = 0; i < expenseCount; i += 1) {
        const category = pick(rng, expenseCategories);
        const amount = makeTransactionAmount(
          rng,
          category,
          monthOffset,
          "expense",
        );

        transactionData.push({
          amount,
          type: "expense",
          category: category.name,
          date: randomDateInMonth(rng, monthStart),
          note: pick(rng, noteTemplates.expense),
          userId: user.id,
        });
      }
    }
  }

  const batchSize = 500;
  for (let i = 0; i < transactionData.length; i += batchSize) {
    await prisma.transaction.createMany({
      data: transactionData.slice(i, i + batchSize),
    });
  }

  const summaryByRole = seededUsers.reduce(
    (acc, user) => {
      acc[user.role] += 1;
      if (!user.isActive) acc.inactive += 1;
      return acc;
    },
    {
      ADMIN: 0,
      ANALYST: 0,
      VIEWER: 0,
      inactive: 0,
    },
  );

  console.log("Assignment seed complete");
  console.log("Users created/updated:", seededUsers.length, summaryByRole);
  console.log("Transactions created:", transactionData.length);
  console.log("Default seeded password:", defaultPassword);
  console.log("Sample logins:");
  console.log("- admin@finance.local /", defaultPassword);
  console.log("- analyst.revenue@finance.local /", defaultPassword);
  console.log("- viewer.ceo@finance.local /", defaultPassword);
};

createAssignmentSeed()
  .catch((error) => {
    console.error("Assignment seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
