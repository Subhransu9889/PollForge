import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../../db/userModel.js";
import { signToken } from "./middleware.js";
import { SignUpPayloadModel, SignInPayloadModel } from "./models.js";

export class AuthenticationController {
    public async SignUpHandler(req: Request, res: Response){
        const validationResult = SignUpPayloadModel.safeParse(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                success: false,
                message: "Invalid payload",
                errors: validationResult.error.issues
            })
        }
        const {firstName, lastName, email, password} = validationResult.data;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email is already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await UserModel.create({ firstName, lastName, email, passwordHash });
        const token = signToken({
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        });

        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        });
    }

    public async SignInHandler(req: Request, res: Response){
        const validationResult = SignInPayloadModel.safeParse(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                success: false,
                message: "Invalid payload",
                errors: validationResult.error.issues
            })
        }

        const { email, password } = validationResult.data;
        const user = await UserModel.findOne({ email });
        const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

        if (!user || !isValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = signToken({
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        });

        return res.json({
            success: true,
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        });
    }
}
