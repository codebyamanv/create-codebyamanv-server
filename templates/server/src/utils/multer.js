import fs from "fs"
import multer from "multer"

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
])

const MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
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
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        // Extension is derived from MIME type, not from the original filename, to prevent extension spoofing
        const ext = MIME_TO_EXT[file.mimetype] || ".bin"
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    },
})

function fileFilter(req, file, cb) {
    if (file.fieldname === "avatar" || file.fieldname === "license") {
        if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Only JPEG, PNG, GIF, and WebP image files are allowed."), false)
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
