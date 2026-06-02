import { baseRouter, userRouter } from "@helpers/routeHelper.js"

export const routes = [
    { path: "/", router: baseRouter },
    { path: "/api/v1/users", router: userRouter },
]

export const corsConfig = {
    origin: [],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}
