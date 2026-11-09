import { v2 as cloudinary } from 'cloudinary';

export const isCloudinaryConfigured = () => Boolean(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_SECRET_KEY
)

const connectCloudinary = () => {
    if (!isCloudinaryConfigured()) {
        console.log("Cloudinary not configured - images will be stored locally in backend/uploads")
        return
    }
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    })
}

export default connectCloudinary
