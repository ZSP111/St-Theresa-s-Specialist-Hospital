import React from 'react'
import { useNavigate } from 'react-router-dom'

const DoctorCard = ({ item }) => {
  const navigate = useNavigate()
  return (
    <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
      <img className='bg-blue-50 w-full' src={item.image} alt={item.name} />
      <div className='p-4'>
        <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
          <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-500'}`}></p>
          <p>{item.available ? 'Available' : 'Not Available'}</p>
        </div>
        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
        <p className='text-gray-600 text-sm'>{item.speciality}</p>
      </div>
    </div>
  )
}

export default DoctorCard
