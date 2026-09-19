import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { IPaymentService } from "../interfaces/services/payment.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";
import { toUserResponse } from "../mappers/user.mapper";

export class PaymentController {
  constructor(private _paymentService: IPaymentService) {}

  public createConnectAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const url = await this._paymentService.createStripeConnectAccount(workerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stripe Connect onboarding URL created",
      data: { url },
    });
  });

  public verifyConnectStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const result = await this._paymentService.verifyStripeConnectStatus(workerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stripe Connect status verified",
      data: {
        stripeOnboardingCompleted: result.completed,
        user: result.user ? toUserResponse(result.user) : undefined
      },
    });
  });

  public createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!._id.toString();
    const { gigId } = req.body;

    if (!gigId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "gigId is required in body",
      });
      return;
    }

    const url = await this._paymentService.createCheckoutSession(gigId, ownerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stripe Checkout session created",
      data: { url },
    });
  });

  public verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "sessionId is required in body",
      });
      return;
    }

    const payment = await this._paymentService.verifyAndProcessPayment(sessionId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Payment verified and payouts split successfully",
      data: { payment },
    });
  });

  public getOwnerPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!._id.toString();
    const data = await this._paymentService.getOwnerPaymentHistory(ownerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Owner payment history fetched successfully",
      data,
    });
  });

  public getWorkerEarningsHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const data = await this._paymentService.getWorkerEarningsHistory(workerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Worker earnings history fetched successfully",
      data,
    });
  });
}
