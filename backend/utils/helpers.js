import jwt from 'jsonwebtoken'

export const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// slotDate "9_11_2026" + slotTime "10:30 AM" -> Date
export const slotToDate = (slotDate, slotTime) => {
    const [day, month, year] = slotDate.split('_').map(Number)
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slotTime.trim())
    if (!day || !month || !year || !match) return null
    let hours = Number(match[1]) % 12
    if (match[3].toUpperCase() === 'PM') hours += 12
    return new Date(year, month - 1, day, hours, Number(match[2]))
}

export const isValidSlot = (slotDate, slotTime) => {
    const date = slotToDate(slotDate, slotTime)
    return date !== null && !isNaN(date.getTime())
}

export const formatSlotDate = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

// Atomically books a slot on a doctor. Returns the updated doctor, or null when
// the doctor is unavailable or the slot was already taken.
export const reserveSlot = (doctorModel, docId, slotDate, slotTime) => doctorModel.findOneAndUpdate(
    { _id: docId, available: true, [`slots_booked.${slotDate}`]: { $ne: slotTime } },
    { $push: { [`slots_booked.${slotDate}`]: slotTime } },
    { new: true }
)

// Releases a booked slot on a doctor (used when cancelling)
export const releaseSlot = (doctorModel, docId, slotDate, slotTime) => doctorModel.updateOne(
    { _id: docId },
    { $pull: { [`slots_booked.${slotDate}`]: slotTime } }
)
