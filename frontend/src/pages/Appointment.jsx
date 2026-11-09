import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toSlotDate, toSlotTime, formatMoney } from '../utils/format'

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const OPENING_HOUR = 10
const CLOSING_HOUR = 21

// Builds 7 days of 30-minute slots, skipping past times and booked slots
const buildSlots = (slotsBooked = {}) => {
  const today = new Date()
  const days = []

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + i)
    currentDate.setSeconds(0, 0)

    const endTime = new Date(currentDate)
    endTime.setHours(CLOSING_HOUR, 0, 0, 0)

    if (i === 0) {
      // today: start from the next half hour, but not before opening time
      if (currentDate.getHours() < OPENING_HOUR) {
        currentDate.setHours(OPENING_HOUR, 0)
      } else {
        const minutes = currentDate.getMinutes()
        currentDate.setMinutes(minutes < 30 ? 30 : 60)
      }
    } else {
      currentDate.setHours(OPENING_HOUR, 0)
    }

    const timeSlots = []
    while (currentDate < endTime) {
      const slotDate = toSlotDate(currentDate)
      const slotTime = toSlotTime(currentDate)
      const isBooked = slotsBooked[slotDate]?.includes(slotTime)
      if (!isBooked) {
        timeSlots.push({ datetime: new Date(currentDate), time: slotTime })
      }
      currentDate.setMinutes(currentDate.getMinutes() + 30)
    }

    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() + i)
    days.push({ date: dayDate, slots: timeSlots })
  }
  return days
}

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, doctorsLoading, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    setDocInfo(doctors.find(doc => doc._id === docId) || null)
    setSlotTime('')
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) setDocSlots(buildSlots(docInfo.slots_booked))
  }, [docInfo])

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Please log in to book an appointment')
      return navigate('/login', { state: { from: `/appointment/${docId}` } })
    }
    if (!slotTime) {
      return toast.warn('Please select a time slot')
    }

    const slot = docSlots[slotIndex].slots.find(s => s.time === slotTime)
    if (!slot) return toast.warn('Please select a time slot')

    setBooking(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/book-appointment',
        { docId, slotDate: toSlotDate(slot.datetime), slotTime },
        { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
        getDoctorsData()
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBooking(false)
    }
  }

  if (!docInfo) {
    return (
      <div className='min-h-[50vh] flex items-center justify-center text-gray-500'>
        {doctorsLoading ? 'Loading...' : 'Doctor not found.'}
      </div>
    )
  }

  return (
    <div>
      {/* ---- Doctor Details --- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt={docInfo.name} />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{formatMoney(docInfo.fees)}</span>
          </p>
        </div>
      </div>

      {/* ---- Booking slots ---- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        {!docInfo.available ? (
          <p className='mt-4 text-sm text-red-500 font-normal'>This doctor is currently not available for appointments.</p>
        ) : (
          <>
            <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
              {docSlots.map((item, index) => (
                <div onClick={() => { setSlotIndex(index); setSlotTime('') }} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} key={index}>
                  <p>{daysOfWeek[item.date.getDay()]}</p>
                  <p>{item.date.getDate()}</p>
                </div>
              ))}
            </div>

            <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
              {docSlots[slotIndex]?.slots.length === 0 && (
                <p className='text-sm font-light text-gray-500'>No slots left for this day. Please choose another day.</p>
              )}
              {docSlots[slotIndex]?.slots.map((item, index) => (
                <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
                  {item.time.toLowerCase()}
                </p>
              ))}
            </div>
            <button onClick={bookAppointment} disabled={booking} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 disabled:opacity-60'>
              {booking ? 'Booking...' : 'Book an appointment'}
            </button>
          </>
        )}
      </div>

      {/* ---- Related Doctors ---- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
