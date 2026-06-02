import { log } from "node:console"
import mongoose from "mongoose"

import { ENV } from "@config/env.js"

const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${ENV.mongo_uri}`)
        log(`\n mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        log("Mongodb connection FAILED ", error)
        process.exit(1)
    }
}
export default connectDatabase
