import { Router } from "express"

import { accessController } from "../middlewares/AuthMiddleware.js"
import { changeAvatar, currentUser, login, logout, register } from "../controllers/user.controller.js"
import { multerUpload } from "../utils/multer.js"

const userRouter = Router()

// Public Routes
userRouter.route("/").post(register)
userRouter.post("/login", login)

// User Only Routes

// Admin and User Routes
userRouter.use(accessController("user", "admin"))
userRouter.get("/current-user", currentUser)
userRouter.patch("/avatar", multerUpload.single("avatar"), changeAvatar)
userRouter.post("/logout", logout)
export default userRouter
