import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import DoctorCard from './DoctorCard'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const [relDoc, setRelDocs] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      setRelDocs(doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId))
    }
  }, [doctors, speciality, docId])

  if (relDoc.length === 0) return null

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>Related Doctors</h1>
      <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
      <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {relDoc.slice(0, 5).map((item) => <DoctorCard key={item._id} item={item} />)}
      </div>
    </div>
  )
}

export default RelatedDoctors
