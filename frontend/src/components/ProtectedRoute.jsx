import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AppContext)
  const location = useLocation()
  if (!token) {
    return <Navigate to='/login' replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

export default ProtectedRoute
