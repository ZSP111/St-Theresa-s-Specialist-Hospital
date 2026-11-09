import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from './AppContext'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const { backendUrl } = useContext(AppContext)

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const headers = { dtoken: dToken }

    const logoutDoctor = () => {
        localStorage.removeItem('dToken')
        setDToken('')
    }

    const handleFailure = (data) => {
        toast.error(data.message)
        if (/log in again/i.test(data.message)) logoutDoctor()
    }

    const getAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers })
            if (data.success) setAppointments(data.appointments)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateAppointment = async (endpoint, appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + `/api/doctor/${endpoint}`, { appointmentId }, { headers })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const completeAppointment = (appointmentId) => updateAppointment('complete-appointment', appointmentId)
    const cancelAppointment = (appointmentId) => updateAppointment('cancel-appointment', appointmentId)

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers })
            if (data.success) setDashData(data.dashData)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers })
            if (data.success) setProfileData(data.profileData)
            else handleFailure(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value = {
        dToken, setDToken, logoutDoctor, backendUrl,
        appointments, getAppointments, completeAppointment, cancelAppointment,
        dashData, getDashData,
        profileData, setProfileData, getProfileData,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
