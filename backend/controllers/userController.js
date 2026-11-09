import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import uploadImage, { getBaseUrl } from '../utils/uploadImage.js'
import { createToken, isValidSlot, slotToDate, reserveSlot, releaseSlot } from '../utils/helpers.js'

// API to register a user
const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body
        const email = String(req.body.email || '').trim().toLowerCase()

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing details' })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password (at least 8 characters)' })
        }
        if (await userModel.findOne({ email })) {
            return res.json({ success: false, message: 'An account with this email already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await new userModel({ name, email, password: hashedPassword }).save()
        const token = createToken({ role: 'user', id: user._id.toString() })

        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        const { password } = req.body
        const email = String(req.body.email || '').trim().toLowerCase()
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }
        const isMatch = await bcrypt.compare(password || '', user.password)
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }
        const token = createToken({ role: 'user', id: user._id.toString() })
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const userData = await userModel.findById(req.userId).select('-password')
        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: 'Missing details' })
        }

        let parsedAddress
        try {
            parsedAddress = typeof address === 'string' ? JSON.parse(address) : (address || { line1: '', line2: '' })
        } catch {
            return res.json({ success: false, message: 'Invalid address format' })
        }

        const update = { name, phone, address: parsedAddress, dob, gender }
        if (imageFile) {
            update.image = await uploadImage(imageFile.path, getBaseUrl(req), imageFile.mimetype)
        }

        await userModel.findByIdAndUpdate(req.userId, update)
        res.json({ success: true, message: 'Profile updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book an appointment
const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime } = req.body

        if (!docId || !slotDate || !slotTime || !isValidSlot(slotDate, slotTime)) {
            return res.json({ success: false, message: 'Please select a valid date and time' })
        }
        if (slotToDate(slotDate, slotTime) < new Date()) {
            return res.json({ success: false, message: 'This time slot has already passed' })
        }

        const docExists = await doctorModel.findById(docId).select('available')
        if (!docExists) {
            return res.json({ success: false, message: 'Doctor not found' })
        }
        if (!docExists.available) {
            return res.json({ success: false, message: 'Doctor is not available' })
        }

        const userData = await userModel.findById(req.userId).select('-password')
        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        // atomically reserve the slot so two patients can't book the same time
        const docData = await reserveSlot(doctorModel, docId, slotDate, slotTime)
        if (!docData) {
            return res.json({ success: false, message: 'This slot is no longer available' })
        }

        const docInfo = docData.toObject()
        delete docInfo.password
        delete docInfo.slots_booked

        const appointment = await new appointmentModel({
            userId: req.userId,
            docId,
            userData,
            docData: docInfo,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }).save()

        res.json({ success: true, message: 'Appointment booked', appointmentId: appointment._id })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to list the user's appointments
const listAppointment = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.userId }).sort({ date: -1 })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel an appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.userId !== req.userId) {
            return res.json({ success: false, message: 'Appointment not found' })
        }
        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment already cancelled' })
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

// ---------------- Paystack online payment ----------------
const PAYSTACK_API = 'https://api.paystack.co'

const paystackRequest = async (path, options = {}) => {
    const response = await fetch(`${PAYSTACK_API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    })
    return response.json()
}

// API to start a Paystack payment for an appointment
const paymentPaystack = async (req, res) => {
    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            return res.json({ success: false, message: 'Online payment is not configured yet. Please pay at the hospital.' })
        }

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.userId !== req.userId) {
            return res.json({ success: false, message: 'Appointment not found' })
        }
        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment cancelled' })
        }
        if (appointmentData.payment) {
            return res.json({ success: false, message: 'Appointment already paid' })
        }

        const reference = `STH-${appointmentId}-${crypto.randomBytes(4).toString('hex')}`
        const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173'

        const data = await paystackRequest('/transaction/initialize', {
            method: 'POST',
            body: JSON.stringify({
                email: appointmentData.userData.email,
                amount: Math.round(appointmentData.amount * 100), // amount in kobo
                currency: process.env.CURRENCY || 'NGN',
                reference,
                callback_url: `${frontendUrl}/my-appointments`,
                metadata: { appointmentId: appointmentId.toString() }
            })
        })

        if (!data.status) {
            return res.json({ success: false, message: data.message || 'Could not start payment' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { paymentReference: reference })
        res.json({ success: true, authorizationUrl: data.data.authorization_url, reference })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify a Paystack payment
const verifyPaystack = async (req, res) => {
    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            return res.json({ success: false, message: 'Online payment is not configured' })
        }
        const { reference } = req.body
        if (!reference) {
            return res.json({ success: false, message: 'Missing payment reference' })
        }

        const appointmentData = await appointmentModel.findOne({ paymentReference: reference, userId: req.userId })
        if (!appointmentData) {
            return res.json({ success: false, message: 'Payment not found' })
        }
        if (appointmentData.payment) {
            return res.json({ success: true, message: 'Payment successful' })
        }

        const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`)
        const paid = data.status && data.data?.status === 'success' &&
            data.data.amount >= Math.round(appointmentData.amount * 100)

        if (!paid) {
            return res.json({ success: false, message: 'Payment was not completed' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentData._id, { payment: true })
        res.json({ success: true, message: 'Payment successful' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    registerUser, loginUser, getProfile, updateProfile, bookAppointment,
    listAppointment, cancelAppointment, paymentPaystack, verifyPaystack
}
