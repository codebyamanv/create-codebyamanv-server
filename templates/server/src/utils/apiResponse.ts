import type { Response } from "express"

class ApiResponse<T = unknown> {
    statusCode: number
    data: T | null
    message: string
    success: boolean

    constructor(statusCode: number, data: T | null, message: string = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }

    static success<T>(data: T, message = "Success", statusCode = 200): ApiResponse<T> {
        return new ApiResponse(statusCode, data, message)
    }

    static created<T>(data: T, message = "Created successfully", statusCode = 201): ApiResponse<T> {
        return new ApiResponse(statusCode, data, message)
    }

    static noContent(message = "No content", statusCode = 204): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static badRequest(message = "Bad request", statusCode = 400): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static unauthorized(message = "Unauthorized", statusCode = 401): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static forbidden(message = "Forbidden", statusCode = 403): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static notFound(message = "Not found", statusCode = 404): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static conflict(message = "Conflict", statusCode = 409): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    static internalServerError(message = "Internal server error", statusCode = 500): ApiResponse<null> {
        return new ApiResponse(statusCode, null, message)
    }

    send(res: Response): Response {
        return res.status(this.statusCode).json({
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            timestamp: new Date().toISOString(),
        })
    }
}

export default ApiResponse
