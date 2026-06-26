import connectDatabase from "./config/database.js"
import { ENV } from "./config/env.js"

import { app } from "./app.js"
import { log } from "node:console"

await connectDatabase()
app.listen(ENV.port, () => {
    log(`Server is running on port ${ENV.port}`)
})
