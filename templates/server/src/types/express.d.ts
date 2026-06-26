import type { IUser } from "../models/user.model.js"
import type { ISession } from "../models/session.model.js"

declare global {
    namespace Express {
        interface Request {
            user?: IUser
            session?: ISession
        }
    }
}
