import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'
import { isCloudinaryConfigured } from '../config/cloudinary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// Serverless hosts (Vercel) have a read-only, temporary file system
const isServerless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

// Uploads an image and returns a URL for it:
// - Cloudinary when configured
// - on serverless hosts, a data: URL stored in the database (persistent, no extra setup)
// - otherwise backend/uploads, served at /uploads
const uploadImage = async (filePath, baseUrl, mimeType = 'image/png') => {
    if (isCloudinaryConfigured()) {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: 'image' })
        return result.secure_url
    }

    if (isServerless()) {
        return `data:${mimeType};base64,${fs.readFileSync(filePath).toString('base64')}`
    }

    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(filePath) || '.png'}`
    fs.copyFileSync(filePath, path.join(UPLOADS_DIR, fileName))
    return `${baseUrl}/uploads/${fileName}`
}

export const getBaseUrl = (req) =>
    process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`

export default uploadImage
