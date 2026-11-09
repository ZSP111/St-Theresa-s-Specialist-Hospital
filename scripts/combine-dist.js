// Puts the dashboard panel build inside the patient website build (served at /admin),
// so one deployment serves the website, the dashboard and the API.
import fs from 'fs'

fs.rmSync('frontend/dist/admin', { recursive: true, force: true })
fs.cpSync('admin/dist', 'frontend/dist/admin', { recursive: true })
console.log('Combined: frontend/dist (website) + frontend/dist/admin (dashboard)')
