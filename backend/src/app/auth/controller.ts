import { Request, Response } from "express";
import { SignUpPayloadModel, SignInPayloadModel } from "./models.js";
class AuthenticationController {
    public async SignUpHandler(req: Request, res: Response){
        const validation = SignUpPayloadModel.safeParse(req.body);

        if(validation.error){
            return res.status(400).json({
                success: false,
                message: "Invalid payload",
                errors: validation.error.issues
            })
        }

    }
}