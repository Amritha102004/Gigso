import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { HttpStatus } from "../utils/http-status.enum";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((e: { message: string }) => e.message).join(", ");
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
        });
        return;
      }
      return next(error);
    }
  };
};
