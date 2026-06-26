import { model, Schema, Types } from "mongoose"

export interface ISession {
    _id: Types.ObjectId
    userId: Types.ObjectId
    token: string
    isRevoked: boolean
    revokedAt?: Date
    revokeReason?: string
    ipAddress?: string
    location?: {
        country?: string
        region?: string
        city?: string
        lat?: number
        lon?: number
        timezone?: string
    }
    userAgent?: string
    device?: string
    browser?: string
    os?: string
    deviceId?: string
    lastActiveAt?: Date
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
}

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },
        revokedAt: Date,
        revokeReason: String,
        ipAddress: {
            type: String,
            index: true,
        },
        location: {
            country: String,
            region: String,
            city: String,
            lat: Number,
            lon: Number,
            timezone: String,
        },
        userAgent: String,
        device: String,
        browser: String,
        os: String,
        deviceId: {
            type: String,
            index: true,
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // TTL — MongoDB auto-deletes expired sessions
        },
    },
    { timestamps: true }
)

const Session = model<ISession>("Session", sessionSchema)
export default Session
