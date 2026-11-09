import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

        <div className='text-center text-2xl pt-10 text-gray-500'>
          <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
        </div>

        <div className='my-10 flex flex-col  justify-center md:flex-row gap-10 mb-28 text-sm'>
          <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />

          <div className='flex flex-col justify-center items-start gap-6'>
            <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
            <p className='text-gray-500'>54 New heaven  <br /> suite 350, Washington, USA</p>
            <p className='text-gray-500'>Tel: <a className='hover:text-primary' href='tel:+2348068088409'>+234 806 808 8409</a> <br /> Email: <a className='hover:text-primary' href='mailto:stthereasashospitalspecialist@gmail.com'>stthereasashospitalspecialist@gmail.com</a></p>
            <p className='font-semibold text-lg text-gray-600'>Careers at St Theresa's</p>
            <p>Learn more about our team and job openings.</p>
            <a href='mailto:stthereasashospitalspecialist@gmail.com?subject=Job%20enquiry' className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</a>
          </div>
        </div>
    </div>
  )
}

export default Contact