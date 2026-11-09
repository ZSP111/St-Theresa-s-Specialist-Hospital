// Request handler for serverless hosting (Vercel). Reuses one database connection
// across requests and loads the sample doctors the first time the database is empty.
import app from './app.js'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import doctorModel from './models/doctorModel.js'
import seedDoctors from './utils/seedDoctors.js'

let ready = null

const init = async () => {
    connectCloudinary()
    await connectDB()
    if (process.env.AUTO_SEED !== 'false' && await doctorModel.countDocuments() === 0) {
        await seedDoctors()
    }
}

export default async function handler(req, res) {
    try {
        ready = ready || init()
        await ready
    } catch (error) {
        ready = null // retry on the next request
        console.error('Startup failed:', error.message)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        const message = process.env.MONGODB_URI
            ? 'Could not connect to the database. Check MONGODB_URI and that MongoDB Atlas allows access from anywhere (0.0.0.0/0).'
            : 'Server is not configured yet: add MONGODB_URI in the hosting settings.'
        return res.end(JSON.stringify({ success: false, message }))
    }
    return app(req, res)
}
