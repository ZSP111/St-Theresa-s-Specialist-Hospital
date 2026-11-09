// Seeds the database with the sample doctors from seed/doctors.json.
// Usage: npm run seed            (adds doctors that don't exist yet)
//        npm run seed -- --reset (removes all doctors first)
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import doctorModel from '../models/doctorModel.js'
import uploadImage from '../utils/uploadImage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '..', 'seed', 'images')
const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed', 'doctors.json'), 'utf8'))

const run = async () => {
    connectCloudinary()
    await connectDB()

    if (process.argv.includes('--reset')) {
        await doctorModel.deleteMany({})
        console.log('Removed existing doctors')
    }

    const password = process.env.SEED_DOCTOR_PASSWORD || 'Doctor@12345'
    const hashedPassword = await bcrypt.hash(password, 10)
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`

    let created = 0
    for (const doc of doctors) {
        if (await doctorModel.findOne({ email: doc.email })) continue
        const image = await uploadImage(path.join(imagesDir, doc.image), baseUrl)
        await doctorModel.create({ ...doc, image, password: hashedPassword, date: Date.now() })
        created++
        console.log(`Added ${doc.name} (${doc.email})`)
    }

    console.log(`Done. ${created} doctor(s) added. Doctor password: ${password}`)
    await mongoose.disconnect()
}

run().catch(async (error) => {
    console.error(error)
    await mongoose.disconnect()
    process.exit(1)
})
