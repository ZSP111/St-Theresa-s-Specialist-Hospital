import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../utils/helpers.js'

// Builds a middleware that reads a JWT from the given header and checks its role.
const makeAuth = (headerName, role, onSuccess) => (req, res, next) => {
    try {
        const token = req.headers[headerName]
        if (!token) {
            return res.json({ success: false, message: 'Not authorized. Please log in again.' })
        }
        const decoded = jwt.verify(token, getJwtSecret())
        if (decoded.role !== role) {
            return res.json({ success: false, message: 'Not authorized. Please log in again.' })
        }
        onSuccess(req, decoded)
        next()
    } catch (error) {
        res.json({ success: false, message: 'Session expired. Please log in again.' })
    }
}

export const authAdmin = makeAuth('atoken', 'admin', (req, decoded) => { req.adminEmail = decoded.email })
export const authDoctor = makeAuth('dtoken', 'doctor', (req, decoded) => { req.docId = decoded.id })
export const authUser = makeAuth('token', 'user', (req, decoded) => { req.userId = decoded.id })
