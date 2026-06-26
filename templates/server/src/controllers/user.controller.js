import fs from "node:fs"
import path from "node:path"
import geoip from "geoip-lite"
import { UAParser } from "ua-parser-js"

import Session from "../models/session.model.js"
import User from "../models/user.model.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import ErrorResponse from "../utils/errorResponse.js"
import { cookieOptions, generateSessionToken } from "../utils/sessionUtils.js"
import { loginValidator, registerValidator } from "../validators/authValidator.js"

function formatZodError(error) {
    return error.issues.map((issue) => issue.message).join(", ")
}

export const register = asyncHandler(async (req, res) => {
    const { success, data, error } = registerValidator.safeParse(req.body)

    if (!success) {
        throw new ErrorResponse(formatZodError(error), 400)
    }

    const { fullname, email, password } = data
    const existing = await User.findOne({ email }).lean()
    if (existing) {
        throw new ErrorResponse("Email already registered", 400)
    }
    await User.create({ fullname, email, password })
    return ApiResponse.created({}, "User registered successfully").send(res)
})

export const login = asyncHandler(async (req, res) => {
    const { success, data, error } = loginValidator.safeParse(req.body)
    if (!success) {
        throw new ErrorResponse(formatZodError(error), 400)
    }

    const user = await User.findOne({ email: data.email })
    if (!user) {
        throw new ErrorResponse("Invalid credentials", 401)
    }
    const isPasswordCorrect = await user.isPasswordCorrect(data.password)
    if (!isPasswordCorrect) {
        throw new ErrorResponse("Invalid credentials", 401)
    }

    const sessionToken = generateSessionToken()

    // req.ip is set correctly when trust proxy is configured in app.js
    const ip = req.ip

    const parser = new UAParser(req.headers["user-agent"])
    const ua = parser.getResult()

    const device = ua.device.type || "desktop"
    const browser = ua.browser.name
    const os = ua.os.name

    const geo = geoip.lookup(ip)

    const MAX_SESSIONS = 3
    const sessions = await Session.find({ userId: user._id, isRevoked: false }).sort({ createdAt: 1 })

    if (sessions.length >= MAX_SESSIONS) {
        const oldest = sessions[0]
        await Session.updateOne(
            { _id: oldest._id },
            { isRevoked: true, revokedAt: new Date(), revokeReason: "max_sessions_limit" }
        )
    }

    await Session.create({
        userId: user._id,
        token: sessionToken,
        ipAddress: ip,
        location: geo
            ? { country: geo.country, region: geo.region, city: geo.city, lat: geo.ll?.[0], lon: geo.ll?.[1] }
            : {},
        userAgent: req.headers["user-agent"],
        device,
        browser,
        os,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    res.cookie("sessionToken", sessionToken, cookieOptions)

    // sessionToken is included here for non-browser clients (e.g. mobile apps) that need
    // Bearer token auth. For web-only apps, remove this from the response and rely solely
    // on the httpOnly cookie set above.
    return ApiResponse.success({ sessionToken }, "Login successful").send(res)
})

export const currentUser = asyncHandler(async (req, res) => {
    return ApiResponse.success(req.user).send(res)
})

export const logout = asyncHandler(async (req, res) => {
    const sessionToken = req.cookies.sessionToken
    if (sessionToken) {
        await Session.updateOne(
            { token: sessionToken },
            { isRevoked: true, revokedAt: new Date(), revokeReason: "logout" }
        )
    }
    res.clearCookie("sessionToken", cookieOptions)
    return ApiResponse.success({}, "Logout successful").send(res)
})

export const changeAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ErrorResponse("Avatar file is required", 400)
    }

    const file = req.file
    const avatar = file.path.replace(/\\/g, "/")

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ErrorResponse("User not found", 404)
    }

    if (user.avatar) {
        const isDefaultAvatar = user.avatar === "uploads/avatar/default/avatar.png"
        if (!isDefaultAvatar) {
            const imagePath = path.join(process.cwd(), user.avatar)
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            } catch (err) {
                console.error("Error deleting old avatar:", err.message)
            }
        }
    }

    await User.findByIdAndUpdate(req.user._id, { avatar })
    return ApiResponse.success({}, "Avatar changed successfully").send(res)
})
