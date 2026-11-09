import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  if (!aToken && !dToken) {
    return (
      <>
        <ToastContainer position='top-right' autoClose={3000} />
        <Login />
      </>
    )
  }

  return (
    <div className='bg-[#F8F9FD] min-h-screen'>
      <ToastContainer position='top-right' autoClose={3000} />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <div className='flex-1 min-w-0'>
          <Routes>
            {aToken ? (
              <>
                <Route path='/' element={<Navigate to='/admin-dashboard' replace />} />
                <Route path='/admin-dashboard' element={<Dashboard />} />
                <Route path='/all-appointments' element={<AllAppointments />} />
                <Route path='/add-doctor' element={<AddDoctor />} />
                <Route path='/doctor-list' element={<DoctorsList />} />
                <Route path='*' element={<Navigate to='/admin-dashboard' replace />} />
              </>
            ) : (
              <>
                <Route path='/' element={<Navigate to='/doctor-dashboard' replace />} />
                <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
                <Route path='/doctor-appointments' element={<DoctorAppointments />} />
                <Route path='/doctor-profile' element={<DoctorProfile />} />
                <Route path='*' element={<Navigate to='/doctor-dashboard' replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
