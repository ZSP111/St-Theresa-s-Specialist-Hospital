import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { slotDateFormat, formatMoney } from '../../utils/format'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) getDashData()
  }, [dToken])

  if (!dashData) return <p className='m-5 text-gray-500'>Loading dashboard...</p>

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <StatCard icon={assets.earning_icon} value={`${currency}${formatMoney(dashData.earnings)}`} label='Earnings' />
        <StatCard icon={assets.appointments_icon} value={dashData.appointments} label='Appointments' />
        <StatCard icon={assets.patients_icon} value={dashData.patients} label='Patients' />
      </div>

      <div className='bg-white mt-10 max-w-4xl'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>
        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.length === 0 && <p className='px-6 pb-4 text-sm text-gray-500'>No bookings yet.</p>}
          {dashData.latestAppointments.map((item) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={item._id}>
              <img className='rounded-full w-10 h-10 object-cover' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              </div>
              <StatusBadge item={item} onCancel={cancelAppointment} onComplete={completeAppointment} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
