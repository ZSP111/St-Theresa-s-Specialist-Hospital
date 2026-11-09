import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { slotDateFormat, calculateAge, formatMoney } from '../../utils/format'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) getAppointments()
  }, [dToken])

  return (
    <div className='max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.length === 0 && <p className='p-6 text-gray-500'>No appointments yet.</p>}
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={item._id}>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 h-8 object-cover rounded-full' src={item.userData.image} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <p className='text-xs text-gray-400'>{item.userData.phone}</p>
              </div>
            </div>
            <div>
              <p className={`text-xs inline border px-2 rounded-full ${item.payment ? 'border-green-500 text-green-600' : 'border-primary'}`}>
                {item.payment ? 'Online' : 'Cash'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{formatMoney(item.amount)}</p>
            <StatusBadge item={item} onCancel={cancelAppointment} onComplete={completeAppointment} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorAppointments
