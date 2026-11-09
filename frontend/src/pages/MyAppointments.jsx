import React, { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { slotDateFormat, formatMoney } from '../utils/format'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const verifiedRef = useRef(false)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setBusyId(appointmentId)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusyId('')
    }
  }

  const payOnline = async (appointmentId) => {
    setBusyId(appointmentId)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-paystack', { appointmentId }, { headers: { token } })
      if (data.success) {
        window.location.href = data.authorizationUrl
      } else {
        toast.error(data.message)
        setBusyId('')
      }
    } catch (error) {
      toast.error(error.message)
      setBusyId('')
    }
  }

  // Paystack redirects back here with ?reference=... after payment
  const verifyPayment = async (reference) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-paystack', { reference }, { headers: { token } })
      if (data.success) toast.success(data.message)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSearchParams({}, { replace: true })
      getUserAppointments()
    }
  }

  useEffect(() => {
    if (!token) return
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference && !verifiedRef.current) {
      verifiedRef.current = true
      verifyPayment(reference)
    } else {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      {loading && <p className='text-sm text-gray-500 mt-4'>Loading appointments...</p>}
      {!loading && appointments.length === 0 && <p className='text-sm text-gray-500 mt-4'>You have no appointments yet.</p>}
      <div>
        {appointments.map((item) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={item._id}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt={item.docData.name} />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address?.line1}</p>
              <p className='text-xs'>{item.docData.address?.line2}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Fee:</span> {currencySymbol}{formatMoney(item.amount)}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && !item.isCompleted && item.payment && (
                <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50 cursor-default'>Paid</button>
              )}
              {!item.cancelled && !item.isCompleted && !item.payment && (
                <button disabled={busyId === item._id} onClick={() => payOnline(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-60'>Pay online</button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button disabled={busyId === item._id} onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300 disabled:opacity-60'>Cancel appointment</button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500 cursor-default'>Appointment cancelled</button>
              )}
              {item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 cursor-default'>Completed</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments
