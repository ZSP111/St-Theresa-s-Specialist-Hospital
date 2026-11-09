import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/* ---- Left Section ---- */}
        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>
            St Theresa's Specialist Hospital brings experienced specialists and compassionate care together in one
            place. Browse our doctors, book an appointment in minutes and manage your visits online.
          </p>
        </div>

        {/* ---- Center Section ---- */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link onClick={() => scrollTo(0, 0)} className='hover:text-primary' to='/'>Home</Link></li>
            <li><Link onClick={() => scrollTo(0, 0)} className='hover:text-primary' to='/about'>About us</Link></li>
            <li><Link onClick={() => scrollTo(0, 0)} className='hover:text-primary' to='/doctors'>Our doctors</Link></li>
            <li><Link onClick={() => scrollTo(0, 0)} className='hover:text-primary' to='/contact'>Contact us</Link></li>
          </ul>
        </div>

        {/* ---- Right Section ---- */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><a className='hover:text-primary' href='tel:+2348068088409'>+234 806 808 8409</a></li>
            <li><a className='hover:text-primary break-all' href='mailto:stthereasashospitalspecialist@gmail.com'>stthereasashospitalspecialist@gmail.com</a></li>
          </ul>
        </div>
      </div>

      {/* ---- Copyright Text ---- */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright © {new Date().getFullYear()} ST THERESA'S SPECIALIST HOSPITAL - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
