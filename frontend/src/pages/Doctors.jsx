import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { specialityData } from '../assets/assets'
import DoctorCard from '../components/DoctorCard'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()
  const { doctors, doctorsLoading } = useContext(AppContext)

  useEffect(() => {
    setFilterDoc(speciality ? doctors.filter(doc => doc.speciality === speciality) : doctors)
  }, [doctors, speciality])

  return (
    <div>
      <p className='text-gray-600'>Browse through our specialist doctors.</p>
      <div className='flex flex-col sm:flex-row items-start gap-6 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {specialityData.map(({ speciality: name }) => (
            <p key={name}
              onClick={() => speciality === name ? navigate('/doctors') : navigate(`/doctors/${name}`)}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === name ? "bg-indigo-100 text-black" : ""}`}>
              {name}
            </p>
          ))}
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item) => <DoctorCard key={item._id} item={item} />)}
        </div>
      </div>
      {doctorsLoading && <p className='text-gray-500 text-sm mt-6'>Loading doctors...</p>}
      {!doctorsLoading && filterDoc.length === 0 && (
        <p className='text-gray-500 text-sm mt-6'>No doctors found{speciality ? ` for ${speciality}` : ''}.</p>
      )}
    </div>
  )
}

export default Doctors
