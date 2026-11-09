// Seeds the database with the sample doctors from seed/doctors.json.
// Usage: npm run seed            (adds doctors that don't exist yet)
//        npm run seed -- --reset (removes all doctors first)
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import seedDoctors from '../utils/seedDoctors.js'

const run = async () => {
    connectCloudinary()
    await connectDB()
    await seedDoctors({ reset: process.argv.includes('--reset') })
    await mongoose.disconnect()
}

run().catch(async (error) => {
    console.error(error)
    await mongoose.disconnect()
    process.exit(1)
})
