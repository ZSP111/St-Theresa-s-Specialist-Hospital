import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center'>
      <p className='text-6xl font-semibold text-primary'>404</p>
      <p className='text-gray-600'>Sorry, we couldn't find that page.</p>
      <button onClick={() => navigate('/')} className='bg-primary text-white px-8 py-3 rounded-full'>Back to home</button>
    </div>
  )
}

export default NotFound
