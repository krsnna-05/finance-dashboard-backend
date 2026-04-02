import type { NextFunction, Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  searchUsersService,
  updateUserService,
} from "./user.service";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const user = await createUserService(payload);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const data = await searchUsersService(query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: data.users,
      meta: data.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await getUserByIdService(id);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const payload = updateUserSchema.parse(req.body);
    const user = await updateUserService(id, payload);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    await deleteUserService(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
