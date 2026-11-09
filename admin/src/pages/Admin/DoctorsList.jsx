import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) getAllDoctors()
  }, [aToken])

  const confirmDelete = (doctor) => {
    if (window.confirm(`Remove ${doctor.name}? Their pending appointments will be cancelled.`)) {
      deleteDoctor(doctor._id)
    }
  }

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      {doctors.length === 0 && <p className='text-sm text-gray-500 mt-4'>No doctors yet. Use "Add Doctor" to create one.</p>}
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item) => (
          <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden group bg-white' key={item._id}>
            <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
              <p className='text-zinc-600 text-sm'>{item.speciality}</p>
              <p className='text-zinc-400 text-xs break-all'>{item.email}</p>
              <div className='mt-2 flex items-center justify-between gap-1 text-sm'>
                <label className='flex items-center gap-1 cursor-pointer'>
                  <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                  <span>Available</span>
                </label>
                <button onClick={() => confirmDelete(item)} className='text-red-500 text-xs hover:underline'>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList
