import multer from "multer"

import { ENV } from "../config/env.js"
import { ApiResponse } from "../helpers/handlersHelper.js"
import { cookieOptions } from "../utils/sessionUtils.js"

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || "Internal server error"

    // Mongoose validation / query errors
    if (err.name === "CastError") {
        statusCode = 404
        message = "Resource not found"
    }

    if (err.code === 11000) {
        statusCode = 400
        message = "Duplicate field value entered"
    }

    if (err.name === "ValidationError") {
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
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large. Maximum allowed size is 5 MB."
        } else {
            message = `File upload error: ${err.message}`
        }
    }

    // Never leak internal error details to the client in production
    if (statusCode === 500 && ENV.isProduction) {
        message = "An unexpected error occurred. Please try again later."
    }

    return ApiResponse.internalServerError(message, statusCode).send(res)
}

export default globalErrorHandler
