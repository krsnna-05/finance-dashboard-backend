import type { NextFunction, Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getTransactionByIdService,
  listTransactionsService,
  updateTransactionService,
} from "./transaction.service";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionIdParamSchema,
  updateTransactionSchema,
} from "./transaction.validation";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = createTransactionSchema.parse(req.body);
    const transaction = await createTransactionService(payload);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
};

export const listTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = listTransactionsQuerySchema.parse(req.query);
    const data = await listTransactionsService(query);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: data.transactions,
      meta: data.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);
    const transaction = await getTransactionByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);
    const payload = updateTransactionSchema.parse(req.body);
    const transaction = await updateTransactionService(id, payload);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = transactionIdParamSchema.parse(req.params);
    await deleteTransactionService(id);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
