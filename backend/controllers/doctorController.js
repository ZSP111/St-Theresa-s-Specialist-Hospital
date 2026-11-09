import bcrypt from 'bcryptjs'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import { createToken, releaseSlot } from '../utils/helpers.js'

// API to get the public list of doctors (for the patient website)
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { password } = req.body
        const email = String(req.body.email || '').trim().toLowerCase()
        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }
        const isMatch = await bcrypt.compare(password || '', doctor.password)
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }
        const token = createToken({ role: 'doctor', id: doctor._id.toString() })
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get the logged-in doctor's appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.docId }).sort({ date: -1 })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark an appointment as completed
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.docId !== req.docId) {
            return res.json({ success: false, message: 'Appointment not found' })
        }
        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'This appointment was cancelled' })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
        res.json({ success: true, message: 'Appointment completed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel an appointment (by doctor)
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.docId !== req.docId) {
            return res.json({ success: false, message: 'Appointment not found' })
        }
        if (appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Completed appointments cannot be cancelled' })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
        await releaseSlot(doctorModel, appointmentData.docId, appointmentData.slotDate, appointmentData.slotTime)
        res.json({ success: true, message: 'Appointment cancelled' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for the doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.docId }).sort({ date: -1 })

        let earnings = 0
        const patients = new Set()
        appointments.forEach((item) => {
            if (!item.cancelled && (item.isCompleted || item.payment)) earnings += item.amount
            patients.add(item.userId)
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.size,
            latestAppointments: appointments.slice(0, 5)
        }
        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get the doctor's profile
const doctorProfile = async (req, res) => {
    try {
        const profileData = await doctorModel.findById(req.docId).select('-password')
        if (!profileData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }
        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update the doctor's profile (fees, address, availability, about)
const updateDoctorProfile = async (req, res) => {
    try {
        const { fees, address, available, about } = req.body
        const update = {}
        if (fees !== undefined) {
            if (isNaN(Number(fees)) || Number(fees) < 0) {
                return res.json({ success: false, message: 'Please enter a valid fee' })
            }
            update.fees = Number(fees)
        }
        if (address !== undefined) update.address = address
        if (available !== undefined) update.available = Boolean(available)
        if (about !== undefined) update.about = about

        await doctorModel.findByIdAndUpdate(req.docId, update)
        res.json({ success: true, message: 'Profile updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for the doctor to toggle their own availability
const changeAvailability = async (req, res) => {
    try {
        const docData = await doctorModel.findById(req.docId)
        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }
        await doctorModel.findByIdAndUpdate(req.docId, { available: !docData.available })
        res.json({ success: true, message: 'Availability changed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel,
    doctorDashboard, doctorProfile, updateDoctorProfile, changeAvailability
}
