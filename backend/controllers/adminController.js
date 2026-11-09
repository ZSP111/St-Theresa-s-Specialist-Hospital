import validator from "validator"
import bcrypt from "bcryptjs"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import uploadImage, { getBaseUrl } from "../utils/uploadImage.js"
import { createToken, releaseSlot } from "../utils/helpers.js"

// API for admin login
const loginAdmin = async (req, res) => {
   try {
      const { password } = req.body
      const email = String(req.body.email || '').trim().toLowerCase()
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
         return res.json({ success: false, message: "Admin credentials are not configured on the server" })
      }
      if (email === process.env.ADMIN_EMAIL.trim().toLowerCase() && password === process.env.ADMIN_PASSWORD) {
         const token = createToken({ role: 'admin', email })
         return res.json({ success: true, token })
      }
      res.json({ success: false, message: "Invalid credentials" })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API for adding doctor
const addDoctor = async (req, res) => {
   try {
      const email = String(req.body.email || '').trim().toLowerCase()
      const { name, password, speciality, degree, experience, about, fees, address } = req.body
      const imageFile = req.file

      // checking for all data to add doctor
      if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
         return res.json({ success: false, message: "Missing details" })
      }

      // validating email format
      if (!validator.isEmail(email)) {
         return res.json({ success: false, message: "Please enter a valid email" })
      }

      // validating strong password
      if (password.length < 8) {
         return res.json({ success: false, message: "Please enter a strong password (at least 8 characters)" })
      }

      if (isNaN(Number(fees)) || Number(fees) < 0) {
         return res.json({ success: false, message: "Please enter a valid fee" })
      }

      if (await doctorModel.findOne({ email })) {
         return res.json({ success: false, message: "A doctor with this email already exists" })
      }

      let parsedAddress
      try {
         parsedAddress = typeof address === 'string' ? JSON.parse(address) : address
      } catch {
         return res.json({ success: false, message: "Invalid address format" })
      }

      // hashing doctor password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // upload image (Cloudinary or local storage)
      const imageUrl = await uploadImage(imageFile.path, getBaseUrl(req))

      const doctorData = {
         name,
         email,
         password: hashedPassword,
         image: imageUrl,
         speciality,
         degree,
         experience,
         about,
         fees: Number(fees),
         address: parsedAddress,
         date: Date.now()
      }

      const newDoctor = new doctorModel(doctorData)
      await newDoctor.save()

      res.json({ success: true, message: "Doctor added" })

   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API to get all doctors for the admin panel
const allDoctors = async (req, res) => {
   try {
      const doctors = await doctorModel.find({}).select('-password')
      res.json({ success: true, doctors })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API to toggle doctor availability
const changeAvailability = async (req, res) => {
   try {
      const { docId } = req.body
      const docData = await doctorModel.findById(docId)
      if (!docData) {
         return res.json({ success: false, message: "Doctor not found" })
      }
      await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
      res.json({ success: true, message: "Availability changed" })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API to delete a doctor
const deleteDoctor = async (req, res) => {
   try {
      const { docId } = req.body
      const deleted = await doctorModel.findByIdAndDelete(docId)
      if (!deleted) {
         return res.json({ success: false, message: "Doctor not found" })
      }
      // cancel the doctor's upcoming appointments
      await appointmentModel.updateMany({ docId, isCompleted: false }, { cancelled: true })
      res.json({ success: true, message: "Doctor removed" })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API to get all appointments
const appointmentsAdmin = async (req, res) => {
   try {
      const appointments = await appointmentModel.find({}).sort({ date: -1 })
      res.json({ success: true, appointments })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API for appointment cancellation by admin
const appointmentCancel = async (req, res) => {
   try {
      const { appointmentId } = req.body
      const appointmentData = await appointmentModel.findById(appointmentId)
      if (!appointmentData) {
         return res.json({ success: false, message: "Appointment not found" })
      }
      if (appointmentData.isCompleted) {
         return res.json({ success: false, message: "Completed appointments cannot be cancelled" })
      }
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
      await releaseSlot(doctorModel, appointmentData.docId, appointmentData.slotDate, appointmentData.slotTime)
      res.json({ success: true, message: "Appointment cancelled" })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
   try {
      const [doctors, users, appointments, latestAppointments] = await Promise.all([
         doctorModel.countDocuments({}),
         userModel.countDocuments({}),
         appointmentModel.countDocuments({}),
         appointmentModel.find({}).sort({ date: -1 }).limit(5),
      ])
      const earningsAgg = await appointmentModel.aggregate([
         { $match: { cancelled: false, $or: [{ payment: true }, { isCompleted: true }] } },
         { $group: { _id: null, total: { $sum: '$amount' } } }
      ])

      const dashData = {
         doctors,
         appointments,
         patients: users,
         earnings: earningsAgg[0]?.total || 0,
         latestAppointments
      }
      res.json({ success: true, dashData })
   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
   }
}

export { loginAdmin, addDoctor, allDoctors, changeAvailability, deleteDoctor, appointmentsAdmin, appointmentCancel, adminDashboard }
