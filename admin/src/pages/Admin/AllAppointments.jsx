import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { slotDateFormat, calculateAge, formatMoney } from '../../utils/format'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) getAllAppointments()
  }, [aToken])

  return (
    <div className='max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Status</p>
        </div>
        {appointments.length === 0 && <p className='p-6 text-gray-500'>No appointments yet.</p>}
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={item._id}>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 h-8 object-cover rounded-full' src={item.userData.image} alt="" />
              <p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 h-8 object-cover rounded-full bg-gray-200' src={item.docData.image} alt="" />
              <p>{item.docData.name}</p>
            </div>
            <div>
              <p>{currency}{formatMoney(item.amount)}</p>
              <p className={`text-xs ${item.payment ? 'text-green-500' : 'text-gray-400'}`}>{item.payment ? 'Paid' : 'Unpaid'}</p>
            </div>
            <StatusBadge item={item} onCancel={cancelAppointment} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllAppointments
