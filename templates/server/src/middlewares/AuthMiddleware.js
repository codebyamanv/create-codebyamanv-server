import { asyncHandler, ErrorResponse } from "@helpers/handlersHelper.js"
import { Session, User } from "@helpers/modelHelper.js"
import { cookieOptions } from "@utils/sessionUtils.js"

export const accessController = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        let sessionToken

        // 🔹 Extract token
        if (req.cookies?.sessionToken) {
            sessionToken = req.cookies.sessionToken
        } else if (req.headers.authorization) {
            const authHeader = req.headers.authorization
            sessionToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader
        }

        if (!sessionToken) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Login to continue", 401))
        }

        // 🔍 Find session
        const session = await Session.findOne({ token: sessionToken })

        if (!session) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Invalid session. Please log in again", 401))
        }

        // 🚫 Check revoked
        if (session.isRevoked) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Session revoked. Please log in again", 401))
        }

        // ⏳ Check expiry (DO NOT delete manually)
        if (session.expiresAt < new Date()) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Session expired. Please log in again", 401))
        }

        // 🔄 Throttled lastActiveAt update
        const now = new Date()
        const THRESHOLD = 5 * 60 * 1000 // 5 minutes

        if (!session.lastActiveAt || now - session.lastActiveAt > THRESHOLD) {
            await Session.updateOne(
                { _id: session._id },
                {
                    $set: { lastActiveAt: now },
                }
            )
        }

        // 👤 Get user
        const user = await User.findById(session.userId).lean()
        if (!user) {
            res.clearCookie("sessionToken", cookieOptions)
            return next(new ErrorResponse("Invalid credentials", 401))
        }

        // 🔐 Role check
        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            return next(new ErrorResponse("You don't have permission.", 403))
        }

        req.user = user
        req.session = session

        next()
    })
}
