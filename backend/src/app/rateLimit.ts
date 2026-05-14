import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix?: string;
  keyGenerator?: (req: Request) => string;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();
const cooldownStore = new Map<string, number>();

function secondsUntil(timestamp: number) {
  return Math.max(1, Math.ceil((timestamp - Date.now()) / 1000));
}

function clientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [key, record] of rateLimitStore) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  for (const [key, resetAt] of cooldownStore) {
    if (resetAt <= now) {
      cooldownStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60_000).unref();

export function rateLimit({
  windowMs,
  maxRequests,
  message,
  keyPrefix = "rate",
  keyGenerator = clientIp,
}: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${keyPrefix}:${keyGenerator(req)}`;
    const existing = rateLimitStore.get(key);
    const record =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + windowMs };

    record.count += 1;
    rateLimitStore.set(key, record);

    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - record.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)));

    if (record.count > maxRequests) {
      res.setHeader("Retry-After", String(secondsUntil(record.resetAt)));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    return next();
  };
}

export function checkCooldown(key: string, cooldownMs: number) {
  const now = Date.now();
  const resetAt = cooldownStore.get(key);

  if (resetAt && resetAt > now) {
    return {
      allowed: false,
      retryAfterSeconds: secondsUntil(resetAt),
    };
  }

  cooldownStore.set(key, now + cooldownMs);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

export function resetCooldown(key: string) {
  cooldownStore.delete(key);
}
