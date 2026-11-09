import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const endpoint = state === 'Sign Up' ? '/api/user/register' : '/api/user/login'
      const payload = state === 'Sign Up' ? { name, email, password } : { email, password }
      const { data } = await axios.post(backendUrl + endpoint, payload)
      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success(state === 'Sign Up' ? 'Account created' : 'Welcome back!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      navigate(location.state?.from || '/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book an appointment</p>
        {
          state === "Sign Up" && <div className='w-full'>
            <p>Full Name</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
          </div>
        }
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" minLength={8} onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>
        <button type='submit' disabled={loading} className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-60'>
          {loading ? 'Please wait...' : state === 'Sign Up' ? "Create Account" : "Login"}
        </button>
        {
          state === "Sign Up"
            ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
            : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
