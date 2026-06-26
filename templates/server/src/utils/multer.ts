import fs from "fs"
import type { Request } from "express"
import multer, { FileFilterCallback } from "multer"

const ALLOWED_IMAGE_TYPES = new Set<string>([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
])

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        let uploadFolder = "uploads/other"

        switch (file.fieldname) {
            case "avatar":
                uploadFolder = "uploads/avatar"
                break
            default:
                uploadFolder = "uploads/other"
        }

        fs.mkdirSync(uploadFolder, { recursive: true })
        cb(null, uploadFolder)
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        // Extension derived from MIME type, not from originalname, to prevent extension spoofing
        const ext = MIME_TO_EXT[file.mimetype] ?? ".bin"
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (file.fieldname === "avatar" || file.fieldname === "license") {
        if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Only JPEG, PNG, GIF, and WebP image files are allowed."))
        }
    } else {
        cb(null, true)
    }
}

export const multerUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})
