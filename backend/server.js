import 'dotenv/config'
import app from './app.js'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'

const port = process.env.PORT || 4000

const start = async () => {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.")
        process.exit(1)
    }
    connectCloudinary()
    await connectDB()
    app.listen(port, () => console.log("Server started on port", port))
}

start().catch((error) => {
    console.error("Failed to start server:", error.message)
    process.exit(1)
})
