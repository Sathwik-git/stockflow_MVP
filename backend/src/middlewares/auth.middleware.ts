import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "stockflow-dev-secret";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      organisationId: string;
    };
    req.user = {
      userId: payload.userId,
      organisationId: payload.organisationId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
