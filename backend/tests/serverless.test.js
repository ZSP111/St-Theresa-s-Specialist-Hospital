// Tests the Vercel serverless handler (api/index.js) against MongoDB:
// first request connects, auto-seeds the sample doctors and serves their photos.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'http'

process.env.VERCEL = '1'
process.env.ADMIN_EMAIL = 'admin@test.com'
process.env.ADMIN_PASSWORD = 'admin-pass'
delete process.env.JWT_SECRET // must work with the derived secret
delete process.env.CLOUDINARY_NAME

let mongod, server, base, mongoose, skipReason = ''

before(async () => {
    let uri = process.env.MONGODB_TEST_URI
    if (!uri) {
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server')
            mongod = await MongoMemoryServer.create()
            uri = mongod.getUri()
        } catch (error) {
            skipReason = `MongoDB unavailable: ${error.message.split('\n')[0]}`
            return
        }
    }
    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB_NAME = `st-theresas-serverless-${Date.now()}`
    mongoose = (await import('mongoose')).default
    const handler = (await import('../../api/index.js')).default
    server = http.createServer(handler).listen(0)
    base = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    server?.close()
    await mongoose?.connection?.db?.dropDatabase()
    await mongoose?.disconnect()
    await mongod?.stop()
})

test('serverless handler: auto-seed, seed photos, login and booking', async (t) => {
    if (skipReason) return t.skip(skipReason)

    const list = await (await fetch(`${base}/api/doctor/list`)).json()
    assert.ok(list.success, list.message)
    assert.equal(list.doctors.length, 15)
    assert.equal(list.doctors[0].image.startsWith('/api/seed-images/'), true)

    const img = await fetch(base + list.doctors[0].image)
    assert.equal(img.status, 200)
    assert.match(img.headers.get('content-type'), /image\/png/)

    const post = (url, body, headers = {}) => fetch(base + url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body)
    }).then(r => r.json())

    assert.ok((await post('/api/admin/login', { email: 'admin@test.com', password: 'admin-pass' })).success)
    assert.ok((await post('/api/doctor/login', { email: 'richard.james@sttheresas.com', password: 'Doctor@12345' })).success)

    const reg = await post('/api/user/register', { name: 'Ada', email: 'ada@test.com', password: 'patient-pass' })
    assert.ok(reg.success, reg.message)
    const d = new Date(); d.setDate(d.getDate() + 3)
    const booked = await post('/api/user/book-appointment',
        { docId: list.doctors[0]._id, slotDate: `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`, slotTime: '11:30 AM' },
        { token: reg.token })
    assert.ok(booked.success, booked.message)
})
