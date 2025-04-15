import { RequestHandler, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/serverTypes";

const secret = process.env.JWT_SECRET || "supersecret";

// explizit typisiert als RequestHandler mit korrekten Generics
export const authenticateToken: RequestHandler = (
  req,
  res: Response,
  next: NextFunction
): any => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Kein Token angegeben" });
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: number };
    // Cast auf AuthRequest – da Express das im Handler nicht direkt weiß
    (req as AuthRequest).user = { id: decoded.userId };
    next();
  } catch (err) {
    console.error("❌ Token ungültig:", err);
    return res.status(403).json({ error: "Token ungültig" });
  }
};
