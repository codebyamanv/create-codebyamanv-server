import { model, Schema } from "mongoose"

const sessionSchema = new Schema(
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

        // Security
        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },
        revokedAt: Date,
        revokeReason: String,

        // Network Info
        ipAddress: {
            type: String,
            index: true,
        },

        // Geo Info
        location: {
            country: String,
            region: String,
            city: String,
            lat: Number,
            lon: Number,
            timezone: String,
        },

        // Device Info
        userAgent: String,
        device: {
            type: String,
        },
        browser: String,
        os: String,

        // Optional but powerfull
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
            index: { expireAfterSeconds: 0 }, // TTL
        },
    },
    {
        timestamps: true,
    }
)

const Session = model("Session", sessionSchema)
export default Session
