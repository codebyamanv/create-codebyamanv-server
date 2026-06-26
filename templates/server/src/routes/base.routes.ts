import type { Request, Response } from "express"
import { Router } from "express"

const baseRouter = Router()

baseRouter.get("/", (req: Request, res: Response) => {
    res.send("Server is running!")
})

export default baseRouter
