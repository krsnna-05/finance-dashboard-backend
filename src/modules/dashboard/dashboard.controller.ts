import type { NextFunction, Request, Response } from "express";
import { getDashboardSummaryService } from "./dashboard.service";
import { dashboardSummaryQuerySchema } from "./dashboard.validation";

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = dashboardSummaryQuerySchema.parse(req.query);
    const data = await getDashboardSummaryService(query);

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
