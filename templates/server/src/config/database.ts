import mongoose from "mongoose"

import { ENV } from "./env.js"

const connectDatabase = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(ENV.mongo_uri)
        console.log(`\n MongoDB connected — DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("MongoDB connection FAILED:", error)
        process.exit(1)
    }
}

export default connectDatabase
