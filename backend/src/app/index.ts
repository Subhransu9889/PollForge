import express from "express";
import { Request, Response } from "express"

export function createExpressApp() {
    const app = express();

    // Middleware and route handlers would be set up here

    app.get("/", (req: Request, res: Response)=>{
        res.send("Hello From the PollForge Backend!");
    })

    return app;
}