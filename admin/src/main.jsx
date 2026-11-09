import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import AppContextProvider from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
    <AppContextProvider>
      <AdminContextProvider>
        <DoctorContextProvider>
          <App />
        </DoctorContextProvider>
      </AdminContextProvider>
    </AppContextProvider>
  </BrowserRouter>,
)
