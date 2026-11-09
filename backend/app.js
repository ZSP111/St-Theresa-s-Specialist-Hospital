import express from 'express'
import cors from 'cors'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import { UPLOADS_DIR } from './utils/uploadImage.js'

const app = express()
app.set('trust proxy', true)

// middleware
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(UPLOADS_DIR))

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.send("ST THERESA'S SPECIALIST HOSPITAL API is running")
})

// error handler (e.g. upload errors from multer)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong' })
})

export default app
