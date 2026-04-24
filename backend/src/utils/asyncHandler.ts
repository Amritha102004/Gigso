import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <P = any>(
  fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<any>
): RequestHandler<P> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
