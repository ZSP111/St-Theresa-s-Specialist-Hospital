import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, specialities } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const initialForm = {
  name: '', email: '', password: '', experience: '1 Year', fees: '', about: '',
  speciality: 'General physician', degree: '', address1: '', address2: ''
}

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const { backendUrl } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (!docImg) return toast.error('Please upload a doctor picture')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('password', form.password)
      formData.append('experience', form.experience)
      formData.append('fees', Number(form.fees))
      formData.append('about', form.about)
      formData.append('speciality', form.speciality)
      formData.append('degree', form.degree)
      formData.append('address', JSON.stringify({ line1: form.address1, line2: form.address2 }))

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { atoken: aToken } })
      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setForm(initialForm)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'border rounded px-3 py-2'

  return (
    <form onSubmit={onSubmitHandler} className='m-5'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>

      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 h-16 object-cover bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" accept='image/*' hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor name</p>
              <input onChange={update('name')} value={form.name} className={inputClass} type="text" placeholder='Name' required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor email</p>
              <input onChange={update('email')} value={form.email} className={inputClass} type="email" placeholder='Email' required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor password</p>
              <input onChange={update('password')} value={form.password} className={inputClass} type="password" placeholder='At least 8 characters' minLength={8} required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Experience</p>
              <select onChange={update('experience')} value={form.experience} className={inputClass}>
                {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={`${n} Year${n > 1 ? 's' : ''}`}>{n} Year{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Fees</p>
              <input onChange={update('fees')} value={form.fees} className={inputClass} type="number" min={0} placeholder='Fees' required />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Speciality</p>
              <select onChange={update('speciality')} value={form.speciality} className={inputClass}>
                {specialities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Education</p>
              <input onChange={update('degree')} value={form.degree} className={inputClass} type="text" placeholder='e.g. MBBS' required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Address</p>
              <input onChange={update('address1')} value={form.address1} className={inputClass} type="text" placeholder='Address line 1' required />
              <input onChange={update('address2')} value={form.address2} className={inputClass} type="text" placeholder='Address line 2' />
            </div>
          </div>
        </div>

        <div>
          <p className='mt-4 mb-2'>About doctor</p>
          <textarea onChange={update('about')} value={form.about} className='w-full px-4 pt-2 border rounded' placeholder='Write about the doctor' rows={5} required />
        </div>

        <button type='submit' disabled={loading} className='bg-primary px-10 py-3 mt-4 text-white rounded-full disabled:opacity-60'>
          {loading ? 'Adding...' : 'Add doctor'}
        </button>
      </div>
    </form>
  )
}

export default AddDoctor
