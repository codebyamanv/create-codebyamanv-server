import fs from 'node:fs'
import path from 'node:path'
import Session from '../models/session.model.js'
import User from '../models/user.model.js'
import ApiResponse from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import ErrorResponse from '../utils/errorResponse.js'
import { cookieOptions, generateSessionToken } from '../utils/sessionUtils.js'
import { loginValidator, registerValidator } from '../validators/authValidator.js'

export const register = asyncHandler(async (req, res) => {
    const { success, data, error } = registerValidator.safeParse(req.body)

    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const { fullname, email, password } = data
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
    const { success, data, error } = loginValidator.safeParse(req.body)
    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const user = await User.findOne({ email: data.email })
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    const isPasswordCorrect = await user.isPasswordCorrect(data.password)
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
    res.cookie('sessionToken', sessionToken, cookieOptions)

    return ApiResponse.success({ sessionToken }, 'Login successful').send(res)
})

export const currentUser = asyncHandler(async (req, res) => {
    return ApiResponse.success(req.user).send(res)
})

export const logout = asyncHandler(async (req, res) => {
    const sessionToken = req.cookies.sessionToken
    await Session.deleteOne({ token: sessionToken })
    res.clearCookie('sessionToken', cookieOptions)
    return ApiResponse.success({}, 'Logout successful').send(res)
})

export const changeAvatar = asyncHandler(async (req, res) => {
    const file = req.file
    const avatar = file.path.replace(/\\/g, '/')

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ErrorResponse('User not found', 404, 'UserNotFoundError')
    }

    if (user.avatar) {
        const isDefaultAvatar = user.avatar === 'uploads/avatar/default/avatar.png'

        if (!isDefaultAvatar) {
            const imagePath = path.join(process.cwd(), user.avatar)

            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            } catch (err) {
                console.error('Error deleting avatar:', err.message)
            }
        }
    }

    await User.findByIdAndUpdate(req.user._id, { avatar })

    return ApiResponse.success({}, 'Avatar changed successfully').send(res)
})
