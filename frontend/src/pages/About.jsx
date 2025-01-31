import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
        <div className='text-center text-2xl pt-10 text-gray-500'>
          <p>About <span className='text-gray-700 font-medium'>Us</span></p>
        </div>

        <div className='my-10 flex flex-col md:flex-row gap-12'>
          <img className='w-full md:max-w-[360px] object-cover' src={assets.about_image} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
              <p>
                Welcome to Prescripto, Your Trusted Partner in managing Your Healthcare Neesds Conveniently And Efficient.
                At Prescripto, We Understand The Challenges Individuals Face When it Comes To Scheduling Doctors
                Appointments And Managing Thier Health Rcords. 
              </p>
              <p>
                Priscripto is Commited To Exellence in Healthcare Technology. we continuosly Strive To Enhance Our
                Platform, Integrating The Latest Advancements To Improve User Experience And Deliver Superior Service.
                Wheather Your're Booking Your First Appointment or Managing Ongoing Care, Prescripto is Here To Support You
                Every Step of The Way 
              </p>
              <b className='text-gray-800'>
                Our Vision
              </b>
              <p>
                Our Vission At Priscripto is To Create A Seamless Healthcare Experience For Every User, We Aim To Bridge The 
                Gap Between Patients And Healthcare Providers, Making it Easiar For You To Acces The Core You Need, When
                You Need It.
              </p>
          </div>
        </div>

        <div className='text-xl my-4'>
          <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
        </div>

         <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 px sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-300 text-gray-600 cursor-pointer'>
              <b>Efficiency:</b>
              <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>

        </div>
        <div className='border px-10 md:px-16 px sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-300 text-gray-600 cursor-pointer'>
              <b>Convenience:</b>
              <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>

        <div className='border px-10 md:px-16 px sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-300 text-gray-600 cursor-pointer'>
             <b>Personalization:</b>
             <p>Tailored recommendations and remainders to help you  stay on top of your health.</p>

        </div>
          

        </div>

        
    </div>
  )
}

export default About