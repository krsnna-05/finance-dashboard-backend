import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { getDashboardSummary } from "./dashboard.controller";

const dashboardRoutes = Router();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary and insights
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional user-specific summary
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional range start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional range end date
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           example: 6
 *         description: Number of months for trend analysis
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 */
dashboardRoutes.get(
  "/summary",
  authenticate,
  authorize(["ADMIN", "ANALYST", "VIEWER"]),
  getDashboardSummary,
);

export default dashboardRoutes;
