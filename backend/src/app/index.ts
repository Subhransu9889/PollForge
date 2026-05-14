import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import { allowedOrigins } from "./cors.js";
import { createAuthRouter } from "./auth/routes.js";
import { createPollRouter } from "./polls/routes.js";
import { rateLimit } from "./rateLimit.js";

export function createExpressApp(): express.Application {
    const app = express();

    app.use(cors({ origin: allowedOrigins(), credentials: true }));
    app.use(express.json());
    app.use(
        "/api",
        rateLimit({
            windowMs: 5 * 60 * 1000,
            maxRequests: 100,
            message: "Too many API requests. Please wait a few minutes and try again.",
            keyPrefix: "api",
        }),
    );

    app.get("/", (req: Request, res: Response)=>{
        res.json({ message: "Hello From the PollForge Backend!" });
    })

    app.use("/api/auth", createAuthRouter());
    app.use("/api/polls", createPollRouter());

    // Global error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack); 
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

    return app;
}
