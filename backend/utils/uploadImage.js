import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'
import { isCloudinaryConfigured } from '../config/cloudinary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// Uploads an image to Cloudinary when configured, otherwise saves it to
// backend/uploads (served at /uploads). Returns a public URL for the image.
const uploadImage = async (filePath, baseUrl) => {
    if (isCloudinaryConfigured()) {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: 'image' })
        return result.secure_url
    }

    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(filePath) || '.png'}`
    fs.copyFileSync(filePath, path.join(UPLOADS_DIR, fileName))
    return `${baseUrl}/uploads/${fileName}`
}

export const getBaseUrl = (req) => process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`

export default uploadImage
