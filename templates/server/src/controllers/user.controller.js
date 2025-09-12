import Session from '../models/session.model.js'
import User from '../models/user.model.js'
import ApiResponse from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import ErrorResponse from '../utils/errorResponse.js'
import { generateSessionToken } from '../utils/sessionUtils.js'

export const register = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        throw new ErrorResponse('Email Already registered', 400, 'UserAlreadyExistsError')
    }
    await User.create({
        fullname,
        email,
        password,
    })
    return ApiResponse.created({}, 'User registered successfully').send(res)
})
export const login = asyncHandler(async (req, res) => {
    const { body } = req
    const user = await User.findOne({ email: body.email.toLowerCase() })
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    const isPasswordCorrect = await user.isPasswordCorrect(body.password)
    if (!isPasswordCorrect) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }

    const sessionToken = generateSessionToken()

    // delete all sessions except the current one
    const allSessions = await Session.find({ userId: user._id })
    if (allSessions.length > 1) {
        await allSessions[0].deleteOne()
    }
    await Session.create({
        userId: user._id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    res.cookie('sessionToken', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        // domain: 'Enter your domain here',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return ApiResponse.success({ sessionToken }, 'Login successful').send(res)
})

export const currentUser = asyncHandler(async (req, res) => {
    return ApiResponse.success(req.user).send(res)
})

export const logout = asyncHandler(async (req, res) => {
    const sessionToken = req.cookies.sessionToken
    await Session.deleteOne({ token: sessionToken })
    res.clearCookie('sessionToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        // domain: 'Enter your domain here',
    })
    return ApiResponse.success({}, 'Logout successful').send(res)
})
