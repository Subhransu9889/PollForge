import { Router } from "express";

export function createAuthRouter(){
    const router = Router();

    // Define authentication-related routes here
    router.post("/login", (req, res) => {
        // Handle login logic
        res.send("Login route");
    });

    router.post("/register", (req, res) => {
        // Handle registration logic
        res.send("Register route");
    });

    return router;
}