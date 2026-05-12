import { Router } from "express";
import { AuthenticationController } from "./controller.js";
import { requireAuth } from "./middleware.js";

export function createAuthRouter(){
    const router = Router();
    const controller = new AuthenticationController();

    router.post("/login", controller.SignInHandler.bind(controller));
    router.post("/register", controller.SignUpHandler.bind(controller));

    router.get("/me", requireAuth, (req, res) => {
        res.json({ success: true, user: req.user });
    });

    return router;
}
