import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import asyncHandler from './utils/asyncHandler.js'
import globalErrorHandler from './middlewares/globalErrorHandler.js'
import baseRouter from './routes/base.routes.js'
import userRouter from './routes/user.routes.js'

const app = express()

app.use(
    cors({
        origin: [],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    }),
)

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))

// serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use(cookieParser())

// add routes
app.use('/', baseRouter)
app.use('/api/users', userRouter)

// error handler
app.all(
    '/*catchAll',
    asyncHandler(async (req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`)
        error.statusCode = 404
        next(error)
    }),
)

app.use(globalErrorHandler)
export { app }
