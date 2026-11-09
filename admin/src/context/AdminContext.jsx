import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from './AppContext'

export const AdminContext = createContext()

const AdminContextProvider = (props) => {
    const { backendUrl } = useContext(AppContext)

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)

    const headers = { atoken: aToken }

    // logs out automatically when the token is rejected
    const handleFailure = (data) => {
        toast.error(data.message)
        if (/log in again/i.test(data.message)) logoutAdmin()
    }

    const logoutAdmin = () => {
        localStorage.removeItem('aToken')
        setAToken('')
    }

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers })
            if (data.success) setDoctors(data.doctors)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const deleteDoctor = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-doctor', { docId }, { headers })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers })
            if (data.success) setAppointments(data.appointments)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                getDashData()
            } else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers })
            if (data.success) setDashData(data.dashData)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value = {
        aToken, setAToken, logoutAdmin,
        doctors, getAllDoctors, changeAvailability, deleteDoctor,
        appointments, getAllAppointments, cancelAppointment,
        dashData, getDashData,
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
