import z, { email } from "zod";

export const SignUpPayloadModel = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.email().max(255),
    password: z.string().min(6).max(100),
})

export const SignInPayloadModel = z.object({
    email: z.email().max(255),
    password: z.string().min(6).max(100),
})