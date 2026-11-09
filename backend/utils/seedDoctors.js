import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import doctorModel from '../models/doctorModel.js'
import uploadImage from './uploadImage.js'
import { isCloudinaryConfigured } from '../config/cloudinary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const SEED_IMAGES_DIR = path.join(__dirname, '..', 'seed', 'images')
const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed', 'doctors.json'), 'utf8'))

// Public URL of this backend outside of a request (Render sets RENDER_EXTERNAL_URL automatically)
export const publicBaseUrl = () =>
    process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 4000}`

// Adds the sample doctors that don't exist yet. Photos go to Cloudinary when configured,
// otherwise they are served straight from the repository at /seed-images (survives restarts).
const seedDoctors = async ({ reset = false, log = console.log } = {}) => {
    if (reset) {
        await doctorModel.deleteMany({})
        log('Removed existing doctors')
    }

    const password = process.env.SEED_DOCTOR_PASSWORD || 'Doctor@12345'
    const hashedPassword = await bcrypt.hash(password, 10)
    const baseUrl = publicBaseUrl()

    let created = 0
    for (const doc of doctors) {
        if (await doctorModel.findOne({ email: doc.email })) continue
        const image = isCloudinaryConfigured()
            ? await uploadImage(path.join(SEED_IMAGES_DIR, doc.image), baseUrl)
            : `${baseUrl}/seed-images/${doc.image}`
        await doctorModel.create({ ...doc, image, password: hashedPassword, date: Date.now() })
        created++
        log(`Added ${doc.name} (${doc.email})`)
    }
    log(`Seeding done. ${created} doctor(s) added. Doctor password: ${password}`)
    return created
}

export default seedDoctors
