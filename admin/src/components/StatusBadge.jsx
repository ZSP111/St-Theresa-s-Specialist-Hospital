import React from 'react'
import { assets } from '../assets/assets'

// Shows the appointment status, or cancel/complete action buttons when it is still pending
const StatusBadge = ({ item, onCancel, onComplete }) => {
  if (item.cancelled) return <p className='text-red-400 text-xs font-medium'>Cancelled</p>
  if (item.isCompleted) return <p className='text-green-500 text-xs font-medium'>Completed</p>
  return (
    <div className='flex'>
      {onCancel && <img onClick={() => { if (window.confirm('Cancel this appointment?')) onCancel(item._id) }} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Cancel" title='Cancel' />}
      {onComplete && <img onClick={() => onComplete(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="Complete" title='Mark completed' />}
    </div>
  )
}

export default StatusBadge
