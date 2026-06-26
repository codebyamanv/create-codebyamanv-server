import { Router } from "express"

import { changeAvatar, currentUser, login, logout, register } from "../controllers/user.controller.js"
import { accessController } from "../middlewares/AuthMiddleware.js"
import { multerUpload } from "../utils/multer.js"

const userRouter = Router()

// Public routes
userRouter.post("/", register)
userRouter.post("/login", login)

// Protected routes (user and admin)
userRouter.use(accessController("user", "admin"))
userRouter.get("/current-user", currentUser)
userRouter.patch("/avatar", multerUpload.single("avatar"), changeAvatar)
userRouter.post("/logout", logout)

export default userRouter
