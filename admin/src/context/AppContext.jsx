import { createContext } from 'react'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currency = '₦'
    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? 'http://localhost:4000' : '')

    return (
        <AppContext.Provider value={{ currency, backendUrl }}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
