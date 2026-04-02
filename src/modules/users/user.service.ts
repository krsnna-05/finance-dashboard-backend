import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";

type Role = "ADMIN" | "ANALYST" | "VIEWER";

type PublicUser = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const toPublicUser = (user: {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const createUserService = async (input: {
  email: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw createHttpError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      role: input.role,
      isActive: input.isActive,
    },
  });

  return toPublicUser(user as PublicUser);
};

export const listUsersService = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};

export const searchUsersService = async (input: {
  email?: string;
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;
  const skip = (page - 1) * limit;
  const emailQuery = (input.email ?? input.search)?.trim();

  const emailFilters = emailQuery
    ? [
        {
          email: {
            contains: emailQuery,
            mode: "insensitive" as const,
          },
        },
        {
          email: {
            startsWith: emailQuery,
            mode: "insensitive" as const,
          },
        },
      ]
    : [];

  const where = {
    ...(emailFilters.length > 0 ? { OR: emailFilters } : {}),
    ...(input.role ? { role: input.role } : {}),
    ...(typeof input.isActive === "boolean"
      ? { isActive: input.isActive }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getUserByIdService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

export const updateUserService = async (
  id: string,
  input: {
    email?: string;
    password?: string;
    role?: Role;
    isActive?: boolean;
  },
) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw createHttpError(404, "User not found");
  }

  const updateData: {
    email?: string;
    password?: string;
    role?: Role;
    isActive?: boolean;
  } = {
    email: input.email,
    role: input.role,
    isActive: input.isActive,
  };

  if (input.password) {
    updateData.password = await bcrypt.hash(input.password, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const deleteUserService = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw createHttpError(404, "User not found");
  }

  await prisma.user.delete({ where: { id } });
};
