// End-to-end API test against an in-memory MongoDB.
// Skipped automatically if the MongoDB binary cannot be downloaded/started.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

process.env.JWT_SECRET = 'test-secret'
process.env.ADMIN_EMAIL = 'admin@test.com'
process.env.ADMIN_PASSWORD = 'admin-pass'
delete process.env.CLOUDINARY_NAME
delete process.env.PAYSTACK_SECRET_KEY

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGE = path.join(__dirname, '..', 'seed', 'images', 'doc1.png')

let mongod, server, base, mongoose, skipReason = ''

before(async () => {
    // Use a provided MongoDB (e.g. a CI service container), otherwise an in-memory server
    let uri = process.env.MONGODB_TEST_URI
    if (!uri) {
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server')
            mongod = await MongoMemoryServer.create()
            uri = mongod.getUri()
        } catch (error) {
            skipReason = `MongoDB in-memory server unavailable: ${error.message.split('\n')[0]}`
            return
        }
    }
    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB_NAME = `st-theresas-test-${Date.now()}`
    mongoose = (await import('mongoose')).default
    const connectDB = (await import('../config/mongodb.js')).default
    const app = (await import('../app.js')).default
    await connectDB()
    server = app.listen(0)
    base = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    server?.close()
    await mongoose?.connection?.db?.dropDatabase()
    await mongoose?.disconnect()
    await mongod?.stop()
})

const call = async (method, url, { body, headers = {}, form } = {}) => {
    const init = { method, headers: { ...headers } }
    if (form) init.body = form
    else if (body) { init.body = JSON.stringify(body); init.headers['Content-Type'] = 'application/json' }
    const res = await fetch(base + url, init)
    return res.json()
}

const nextSlot = () => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return { slotDate: `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`, slotTime: '10:30 AM' }
}

test('full booking flow: admin -> doctor -> patient', async (t) => {
    if (skipReason) return t.skip(skipReason)

    // admin login
    assert.equal((await call('POST', '/api/admin/login', { body: { email: 'x', password: 'y' } })).success, false)
    const admin = await call('POST', '/api/admin/login', { body: { email: 'admin@test.com', password: 'admin-pass' } })
    assert.ok(admin.success)
    const atoken = admin.token

    // protected route without token
    assert.equal((await call('GET', '/api/admin/all-doctors')).success, false)

    // add doctor
    const form = new FormData()
    Object.entries({
        name: 'Dr. Test', email: 'doc@test.com', password: 'doctor-pass', speciality: 'Neurologist',
        degree: 'MBBS', experience: '3 Years', about: 'About', fees: '15000',
        address: JSON.stringify({ line1: 'L1', line2: 'L2' })
    }).forEach(([k, v]) => form.append(k, v))
    form.append('image', new Blob([fs.readFileSync(IMAGE)], { type: 'image/png' }), 'doc1.png')
    const added = await call('POST', '/api/admin/add-doctor', { headers: { atoken }, form })
    assert.ok(added.success, added.message)

    // public doctor list hides password and email
    const list = await call('GET', '/api/doctor/list')
    assert.equal(list.doctors.length, 1)
    assert.equal(list.doctors[0].password, undefined)
    assert.equal(list.doctors[0].email, undefined)
    assert.match(list.doctors[0].image, /\/uploads\//)
    const docId = list.doctors[0]._id

    // patient register / login / profile
    assert.equal((await call('POST', '/api/user/register', { body: { name: 'P', email: 'bad', password: '12345678' } })).success, false)
    assert.equal((await call('POST', '/api/user/register', { body: { name: 'P', email: 'p@test.com', password: 'short' } })).success, false)
    assert.ok((await call('POST', '/api/user/register', { body: { name: 'Pat', email: 'p@test.com', password: 'patient-pass' } })).success)
    assert.equal((await call('POST', '/api/user/register', { body: { name: 'Dup', email: 'P@Test.com', password: 'patient-pass' } })).success, false, 'duplicate email (any case) must fail')
    assert.equal((await call('POST', '/api/user/login', { body: { email: 'p@test.com', password: 'wrong-pass' } })).success, false)
    const login = await call('POST', '/api/user/login', { body: { email: ' P@TEST.com ', password: 'patient-pass' } })
    assert.ok(login.success)
    const token = login.token
    const profile = await call('GET', '/api/user/get-profile', { headers: { token } })
    assert.equal(profile.userData.name, 'Pat')
    assert.equal(profile.userData.password, undefined)

    const upd = await call('POST', '/api/user/update-profile', {
        headers: { token },
        body: { name: 'Patient One', phone: '08000000000', address: { line1: 'A', line2: 'B' }, dob: '2000-01-20', gender: 'Female' }
    })
    assert.ok(upd.success, upd.message)

    // a user token cannot access admin routes
    assert.equal((await call('GET', '/api/admin/appointments', { headers: { atoken: token } })).success, false)

    // booking
    const { slotDate, slotTime } = nextSlot()
    const booked = await call('POST', '/api/user/book-appointment', { headers: { token }, body: { docId, slotDate, slotTime } })
    assert.ok(booked.success, booked.message)
    const again = await call('POST', '/api/user/book-appointment', { headers: { token }, body: { docId, slotDate, slotTime } })
    assert.equal(again.success, false, 'double booking must fail')
    const past = await call('POST', '/api/user/book-appointment', { headers: { token }, body: { docId, slotDate: '1_1_2020', slotTime } })
    assert.equal(past.success, false)

    const mine = await call('GET', '/api/user/appointments', { headers: { token } })
    assert.equal(mine.appointments.length, 1)
    assert.equal(mine.appointments[0].amount, 15000)
    assert.equal(mine.appointments[0].userData.name, 'Patient One')

    // payment without Paystack configured gives a friendly error
    const pay = await call('POST', '/api/user/payment-paystack', { headers: { token }, body: { appointmentId: booked.appointmentId } })
    assert.equal(pay.success, false)

    // doctor login + dashboard + complete
    const dlogin = await call('POST', '/api/doctor/login', { body: { email: 'doc@test.com', password: 'doctor-pass' } })
    assert.ok(dlogin.success)
    const dtoken = dlogin.token
    const dappts = await call('GET', '/api/doctor/appointments', { headers: { dtoken } })
    assert.equal(dappts.appointments.length, 1)
    assert.ok((await call('POST', '/api/doctor/complete-appointment', { headers: { dtoken }, body: { appointmentId: booked.appointmentId } })).success)
    const ddash = await call('GET', '/api/doctor/dashboard', { headers: { dtoken } })
    assert.equal(ddash.dashData.earnings, 15000)
    assert.equal(ddash.dashData.patients, 1)

    // completed appointment cannot be cancelled by the patient
    assert.equal((await call('POST', '/api/user/cancel-appointment', { headers: { token }, body: { appointmentId: booked.appointmentId } })).success, false)

    // book a second slot, cancel it, and check the slot is released
    const second = await call('POST', '/api/user/book-appointment', { headers: { token }, body: { docId, slotDate, slotTime: '11:00 AM' } })
    assert.ok(second.success)
    assert.ok((await call('POST', '/api/user/cancel-appointment', { headers: { token }, body: { appointmentId: second.appointmentId } })).success)
    const listAfterCancel = await call('GET', '/api/doctor/list')
    assert.deepEqual(listAfterCancel.doctors[0].slots_booked[slotDate], [slotTime])

    // doctor profile update
    assert.ok((await call('POST', '/api/doctor/update-profile', { headers: { dtoken }, body: { fees: 20000, available: false } })).success)
    const dprof = await call('GET', '/api/doctor/profile', { headers: { dtoken } })
    assert.equal(dprof.profileData.fees, 20000)
    assert.equal(dprof.profileData.available, false)

    // unavailable doctor cannot be booked
    const blocked = await call('POST', '/api/user/book-appointment', { headers: { token }, body: { docId, slotDate, slotTime: '12:00 PM' } })
    assert.equal(blocked.success, false)

    // admin dashboard + toggle availability + cancel
    const dash = await call('GET', '/api/admin/dashboard', { headers: { atoken } })
    assert.equal(dash.dashData.doctors, 1)
    assert.equal(dash.dashData.patients, 1)
    assert.equal(dash.dashData.appointments, 2)
    assert.equal(dash.dashData.earnings, 15000)
    assert.ok((await call('POST', '/api/admin/change-availability', { headers: { atoken }, body: { docId } })).success)
    const all = await call('GET', '/api/admin/all-doctors', { headers: { atoken } })
    assert.equal(all.doctors[0].available, true)
    assert.ok((await call('POST', '/api/admin/delete-doctor', { headers: { atoken }, body: { docId } })).success)
    assert.equal((await call('GET', '/api/doctor/list')).doctors.length, 0)
})
