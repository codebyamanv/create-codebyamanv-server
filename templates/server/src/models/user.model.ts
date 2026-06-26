import bcrypt from "bcrypt"
import { model, Model, Schema, Types } from "mongoose"

export interface IUser {
    _id: Types.ObjectId
    role: "user" | "admin"
    fullname: string
    fullnameLower?: string
    email: string
    password: string
    avatar: string
    avatarPath?: string
    createdAt: Date
    updatedAt: Date
}

interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        role: {
            type: String,
            required: true,
            enum: ["user", "admin"],
            default: "user",
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Fullname must be at most 100 characters"],
        },
        fullnameLower: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, "Email must be at most 254 characters"],
            match: [/^\S+@\S+\.\S+$/, "Invalid email"],
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
            default: "uploads/avatar/default/avatar.png",
        },
        avatarPath: {
            type: String,
        },
    },
    { timestamps: true }
)

// Indexes
userSchema.index({ fullnameLower: 1 })
userSchema.index({ createdAt: -1 })

// Hooks
userSchema.pre("save", async function (next) {
    if (this.isModified("fullname")) {
        this.fullnameLower = this.fullname.toLowerCase()
    }
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

const User = model<IUser, UserModel>("User", userSchema)
export default User
