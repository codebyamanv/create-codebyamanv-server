import path from "path"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import morgan from "morgan"

import { ENV } from "./config/env.js"
import globalErrorHandler from "./middlewares/globalErrorHandler.js"
import asyncHandler from "./utils/asyncHandler.js"

import { corsConfig, routes } from "./constant.js"

const app = express()

// Trust the first proxy hop so req.ip reflects the real client IP
// Set to the number of trusted proxy hops in your infrastructure (e.g. 1 for a single load balancer)
app.set("trust proxy", 1)

app.use(cors(corsConfig))
app.use(helmet())
app.use(morgan(ENV.isProduction ? "combined" : "dev"))
app.use(cookieParser())
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// Serve static uploads with cross-origin resource policy set for assets
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
    next()
})
app.use("/api/v1/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000,
        message: { error: "Too many requests." },
        standardHeaders: "draft-8",
        legacyHeaders: false,
    })
)

// add routes
routes.forEach(({ path, router }) => {
    app.use(path, router)
})

// 404 handler
app.all(
    "/*catchAll",
    asyncHandler(async (req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`)
        error.statusCode = 404
        next(error)
    })
)

app.use(globalErrorHandler)
export { app }
