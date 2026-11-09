import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'

const adminLinks = [
  { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
  { to: '/all-appointments', icon: assets.appointment_icon, label: 'Appointments' },
  { to: '/add-doctor', icon: assets.add_icon, label: 'Add Doctor' },
  { to: '/doctor-list', icon: assets.people_icon, label: 'Doctors List' },
]

const doctorLinks = [
  { to: '/doctor-dashboard', icon: assets.home_icon, label: 'Dashboard' },
  { to: '/doctor-appointments', icon: assets.appointment_icon, label: 'Appointments' },
  { to: '/doctor-profile', icon: assets.people_icon, label: 'Profile' },
]

const Sidebar = () => {
  const { aToken } = useContext(AdminContext)
  const links = aToken ? adminLinks : doctorLinks

  return (
    <div className='min-h-screen bg-white border-r'>
      <ul className='text-[#515151] mt-5'>
        {links.map(link => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
            <img className='min-w-5' src={link.icon} alt="" />
            <p className='hidden md:block'>{link.label}</p>
          </NavLink>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar
