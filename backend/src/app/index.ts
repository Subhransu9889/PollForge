import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { createAuthRouter } from "./auth/routes.js";
import { createPollRouter } from "./polls/routes.js";

export function createExpressApp() {
    const app = express();

    app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
    app.use(express.json());

    app.get("/", (req: Request, res: Response)=>{
        res.json({ message: "Hello From the PollForge Backend!" });
    })

    app.use("/api/auth", createAuthRouter());
    app.use("/api/polls", createPollRouter());

    return app;
}
