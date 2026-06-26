import type { Router } from "express"
import type { CorsOptions } from "cors"

import { ENV } from "./config/env.js"
import { baseRouter, userRouter } from "./helpers/routeHelper.js"

interface RouteDefinition {
    path: string
    router: Router
}

export const routes: RouteDefinition[] = [
    { path: "/", router: baseRouter },
    { path: "/api/v1/users", router: userRouter },
]

export const corsConfig: CorsOptions = {
    origin: ENV.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}
