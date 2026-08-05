import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { PaymentService } from "../services/payment.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";
import { userRepository, gigRepository, gigApplicationRepository } from "../config/container";
import { toUserResponse } from "../mappers/user.mapper";

export class PaymentController {
  constructor(private _paymentService: PaymentService) {}

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
    const completed = await this._paymentService.verifyStripeConnectStatus(workerId);
    const user = await userRepository.findById(workerId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stripe Connect status verified",
      data: {
        stripeOnboardingCompleted: completed,
        user: user ? toUserResponse(user) : undefined
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
    const payments = await this._paymentService.getOwnerPayments(ownerId);
    
    // Fetch completed but unpaid gigs for the owner
    const gigs = await gigRepository.findByOwnerId(ownerId);
    const unpaidGigs = gigs.filter(g => g.status === "completed" && g.paymentStatus === "unpaid");

    const pendingPayments = [];
    for (const gig of unpaidGigs) {
      const apps = await gigApplicationRepository.findByGigId(gig._id.toString());
      const hiredApps = apps.filter(a => a.status === "accepted");

      let subtotal = 0;
      const workers = hiredApps.map(app => {
        const role = app.roleId as any;
        const wUser = app.workerId as any;
        const amount = role?.payPerPerson || 0;
        subtotal += amount;
        return {
          id: wUser?._id?.toString() || wUser?.id?.toString() || app.workerId.toString(),
          name: wUser?.name || "Worker",
          roleName: role?.roleName || "Staff",
          amount,
        };
      });

      const platformFee = Math.round(subtotal * 0.1);
      const totalAmount = subtotal + platformFee;

      pendingPayments.push({
        id: gig._id.toString(),
        title: gig.title,
        totalBudget: gig.totalBudget,
        subtotal,
        platformFee,
        totalAmount,
        workers,
      });
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Owner payment history fetched successfully",
      data: { payments, pendingPayments },
    });
  });

  public getWorkerEarningsHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const payouts = await this._paymentService.getWorkerEarnings(workerId);
    
    // Fetch pending payouts from accepted applications on completed unpaid gigs
    const apps = await gigApplicationRepository.findByWorkerId(workerId, "accepted");
    const pendingPayouts = [];
    for (const app of apps) {
      const gig = app.gigId as any;
      if (gig && gig.status === "completed" && gig.paymentStatus === "unpaid") {
        const role = app.roleId as any;
        pendingPayouts.push({
          id: app._id.toString(),
          gigTitle: gig.title,
          amount: role?.payPerPerson || 0,
          eventDate: gig.eventDate,
        });
      }
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Worker earnings history fetched successfully",
      data: { payouts, pendingPayouts },
    });
  });
}
