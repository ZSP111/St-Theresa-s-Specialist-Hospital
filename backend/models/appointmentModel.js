import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },   // format: day_month_year e.g. 9_11_2026
    slotTime: { type: String, required: true },   // format: e.g. 10:30 AM
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    paymentReference: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
}, { minimize: false })

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)

export default appointmentModel
