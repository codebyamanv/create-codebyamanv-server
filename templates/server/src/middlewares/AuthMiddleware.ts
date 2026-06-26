import type { NextFunction, Request, Response } from "express"

import asyncHandler from "../utils/asyncHandler.js"
import ErrorResponse from "../utils/errorResponse.js"
import { cookieOptions } from "../utils/sessionUtils.js"
import Session from "../models/session.model.js"
import User from "../models/user.model.js"

export const accessController = (...allowedRoles: string[]) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let sessionToken: string | undefined

        if (req.cookies?.sessionToken) {
            sessionToken = req.cookies.sessionToken as string
        } else if (req.headers.authorization) {
            const authHeader = req.headers.authorization
            sessionToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader
        }

        if (!sessionToken) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Login to continue", 401))
        }

        const session = await Session.findOne({ token: sessionToken })

        if (!session) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Invalid session. Please log in again", 401))
        }

        if (session.isRevoked) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Session revoked. Please log in again", 401))
        }

        if (session.expiresAt < new Date()) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Session expired. Please log in again", 401))
        }

        // Throttled lastActiveAt update — only write if more than 5 minutes have passed
        const now = new Date()
        const THRESHOLD = 5 * 60 * 1000

        if (!session.lastActiveAt || now.getTime() - session.lastActiveAt.getTime() > THRESHOLD) {
            await Session.updateOne({ _id: session._id }, { $set: { lastActiveAt: now } })
        }

        const user = await User.findById(session.userId).lean()
        if (!user) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Invalid credentials", 401))
        }

        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            return next(new ErrorResponse("You don't have permission.", 403))
        }

        req.user = user
        req.session = session

        next()
    })
}
