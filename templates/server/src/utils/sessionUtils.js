import crypto from "crypto"
import { ENV } from "../config/env.js"

export const generateSessionToken = () => {
    return crypto.randomBytes(32).toString("hex")
}

export const cookieOptions = {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: ENV.isProduction ? "none" : "lax",
    path: "/",
    // domain: 'yourdomain.com',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
