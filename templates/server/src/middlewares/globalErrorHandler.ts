import type { NextFunction, Request, Response } from "express"
import multer from "multer"

import { ENV } from "../config/env.js"
import ApiResponse from "../utils/apiResponse.js"
import { cookieOptions } from "../utils/sessionUtils.js"

interface AppError extends Error {
    statusCode?: number
    code?: number | string
    errors?: Record<string, { message: string }>
}

const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    let statusCode = err.statusCode ?? 500
    let message = err.message || "Internal server error"

    // Mongoose errors
    if (err.name === "CastError") {
        statusCode = 404
        message = "Resource not found"
    }

    if (err.code === 11000) {
        statusCode = 400
        message = "Duplicate field value entered"
    }

    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ")
    }

    // Session errors
    if (err.name === "SessionExpiredError") {
        statusCode = 401
        message = "Session expired. Please login again"
        res.clearCookie("sessionToken", cookieOptions)
    }

    if (err.name === "InvalidSessionError") {
        statusCode = 401
        message = "Invalid session. Please login again"
        res.clearCookie("sessionToken", cookieOptions)
    }

    if (err.name === "CookieNotFoundError") {
        statusCode = 401
        message = "Authentication required"
    }

    // Multer errors (file upload)
    if (err instanceof multer.MulterError) {
        statusCode = 400
        message =
            err.code === "LIMIT_FILE_SIZE"
                ? "File is too large. Maximum allowed size is 5 MB."
                : `File upload error: ${err.message}`
    }

    // Never expose internal error details to the client in production
    if (statusCode === 500 && ENV.isProduction) {
        message = "An unexpected error occurred. Please try again later."
    }

    ApiResponse.internalServerError(message, statusCode).send(res)
}

export default globalErrorHandler
