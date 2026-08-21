import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { AdminPaymentService } from "../services/adminPayment.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class AdminPaymentController {
  constructor(private _adminPaymentService: AdminPaymentService) {}

  public getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const range = (req.query.range as string) || "30";
    const data = await this._adminPaymentService.getDashboardStats(range);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Admin payment stats fetched successfully",
      data,
    });
  });

  public getTransactionsList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "all";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await this._adminPaymentService.getTransactionsList(search, status, page, limit);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Transactions list fetched successfully",
      data,
    });
  });

  public getTransactionDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Payment ID parameter is required",
      });
      return;
    }

    const data = await this._adminPaymentService.getTransactionDetails(id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Transaction details fetched successfully",
      data,
    });
  });
}
