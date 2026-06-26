import crypto from "crypto"
import type { CookieOptions } from "express"

import { ENV } from "../config/env.js"

export const generateSessionToken = (): string => {
    return crypto.randomBytes(32).toString("hex")
}

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: ENV.isProduction ? "none" : "lax",
    path: "/",
    // domain: "yourdomain.com",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
