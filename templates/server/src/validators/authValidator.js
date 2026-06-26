import z from "zod/v4"

export const loginValidator = z.object({
    email: z.email("Invalid email").max(254, "Email must be at most 254 characters"),
    // max 128 chars: bcrypt silently truncates at 72 bytes, a hard cap prevents abuse
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),
})

export const registerValidator = loginValidator.extend({
    fullname: z
        .string()
        .min(1, "Fullname is required")
        .max(100, "Fullname must be at most 100 characters")
        .regex(/^[^\d]*$/, "Fullname must not contain digits")
        .transform((val) => val.trim()),
})
