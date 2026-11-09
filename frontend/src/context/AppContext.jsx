import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₦'
    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? 'http://localhost:4000' : '')

    const [doctors, setDoctors] = useState([])
    const [doctorsLoading, setDoctorsLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [userData, setUserData] = useState(false)

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Could not load doctors. Please check your connection.')
        } finally {
            setDoctorsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        setUserData(false)
    }

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
                logout()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token)
            loadUserProfileData()
        } else {
            setUserData(false)
        }
    }, [token])

    const value = {
        doctors, doctorsLoading, getDoctorsData,
        currencySymbol,
        backendUrl,
        token, setToken, logout,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
