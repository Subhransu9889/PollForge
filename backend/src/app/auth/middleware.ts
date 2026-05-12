import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const jwtSecret = () => process.env.JWT_SECRET ?? "pollforge-dev-secret";

export function signToken(user: AuthUser) {
  return jwt.sign(user, jwtSecret(), { expiresIn: "7d" });
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, jwtSecret()) as AuthUser;
  } catch {
    delete req.user;
  }

  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    return next();
  });
}
