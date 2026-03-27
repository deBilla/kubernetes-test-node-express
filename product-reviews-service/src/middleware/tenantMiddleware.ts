import { Request, Response, NextFunction } from "express";

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") return next();

  const tenantId = req.headers["x-tenant-id"] as string;
  if (!tenantId) {
    return res.status(400).json({ error: "X-Tenant-Id header is required" });
  }

  (req as any).tenantId = tenantId;
  next();
};
