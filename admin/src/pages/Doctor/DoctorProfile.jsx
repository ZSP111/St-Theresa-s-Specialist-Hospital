import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { formatMoney } from '../../utils/format'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateProfile = async () => {
    setSaving(true)
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
        about: profileData.about,
      }
      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dtoken: dToken } })
      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (dToken) getProfileData()
  }, [dToken])

  if (!profileData) return <p className='m-5 text-gray-500'>Loading profile...</p>

  return (
    <div className='flex flex-col gap-4 m-5'>
      <div>
        <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
      </div>

      <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white max-w-3xl'>
        <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name}</p>
        <div className='flex items-center gap-2 mt-1 text-gray-600'>
          <p>{profileData.degree} - {profileData.speciality}</p>
          <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
        </div>

        <div>
          <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About:</p>
          {isEdit
            ? <textarea onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} className='w-full outline-primary p-2 border rounded text-sm mt-1' rows={6} value={profileData.about} />
            : <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{profileData.about}</p>}
        </div>

        <p className='text-gray-600 font-medium mt-4'>
          Appointment fee: <span className='text-gray-800'>
            {currency}{isEdit
              ? <input type='number' min={0} className='border rounded px-2 w-32' onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} />
              : formatMoney(profileData.fees)}
          </span>
        </p>

        <div className='flex gap-2 py-2'>
          <p>Address:</p>
          <p className='text-sm'>
            {isEdit
              ? <input type='text' className='border rounded px-2' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address?.line1 || ''} />
              : profileData.address?.line1}
            <br />
            {isEdit
              ? <input type='text' className='border rounded px-2 mt-1' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address?.line2 || ''} />
              : profileData.address?.line2}
          </p>
        </div>

        <label className='flex gap-1 pt-2 items-center cursor-pointer w-fit'>
          <input type="checkbox" disabled={!isEdit} onChange={() => setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} />
          <span>Available for appointments</span>
        </label>

        {isEdit
          ? <div className='flex gap-3 mt-5'>
            <button disabled={saving} onClick={updateProfile} className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all disabled:opacity-60'>{saving ? 'Saving...' : 'Save'}</button>
            <button disabled={saving} onClick={() => { setIsEdit(false); getProfileData() }} className='px-4 py-1 border text-sm rounded-full hover:bg-gray-100 transition-all'>Cancel</button>
          </div>
          : <button onClick={() => setIsEdit(true)} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Edit</button>}
      </div>
    </div>
  )
}

export default DoctorProfile
