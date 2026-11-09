# ST THERESA'S SPECIALIST HOSPITAL

A full-stack (MERN) appointment booking system for St Theresa's Specialist Hospital.

| App | Folder | Default URL | Who uses it |
| --- | --- | --- | --- |
| Patient website | `frontend/` | http://localhost:5173 | Patients: browse doctors, sign up, book/cancel/pay for appointments, manage profile |
| Dashboard panel | `admin/` | http://localhost:5174 (served at `/admin` in production) | **Admin**: dashboard, add/remove doctors, toggle availability, view/cancel all appointments.<br>**Doctors**: dashboard & earnings, complete/cancel appointments, edit profile & fees |
| REST API | `backend/` | http://localhost:4000 | Express + MongoDB, JWT auth, image uploads, Paystack payments |

## Features

- Patient sign up / login (JWT, bcrypt-hashed passwords)
- Doctors list with speciality filter and live availability
- 7-day booking calendar with 30-minute slots (10:00 AM - 9:00 PM); booked and past slots are hidden, double-booking is prevented atomically on the server
- My Appointments: cancel, pay online with **Paystack** (NGN), payment verification on return
- My Profile: edit details and upload a profile photo
- Admin panel: stats dashboard, add doctor (with photo), doctor list, availability toggle, remove doctor, all appointments
- Doctor panel: stats & earnings, appointment list with complete/cancel, editable profile (fees, address, about, availability)
- Images are uploaded to **Cloudinary** if configured, otherwise stored locally in `backend/uploads`

## Requirements

- Node.js 18+ (20 or 22 recommended)
- A MongoDB database - free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Optional: [Cloudinary](https://cloudinary.com) account for image hosting
- Optional: [Paystack](https://paystack.com) account for online payments

## Setup

```bash
# 1. install dependencies for all three apps
npm run install-all

# 2. configure the backend
cp backend/.env.example backend/.env
#    then edit backend/.env: MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (+ optional keys)

# 3. (optional) point the frontends at a different API URL
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env

# 4. load the 15 sample doctors (password: SEED_DOCTOR_PASSWORD, default Doctor@12345)
npm run seed

# 5. run everything (in three terminals)
npm run backend
npm run frontend
npm run admin
```

Log in to the dashboard panel with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, or as a doctor using
a doctor's email (e.g. `richard.james@sttheresas.com`) and their password.

### Backend environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string (without database name) |
| `MONGODB_DB_NAME` | no | Database name (default `st-theresas-hospital`) |
| `JWT_SECRET` | recommended | Long random string used to sign login tokens (derived from `MONGODB_URI` if unset) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes | Admin panel login |
| `PORT` | no | API port (default 4000) |
| `FRONTEND_URL` | for payments | Patient website URL; Paystack redirects back here |
| `BACKEND_URL` | no | Public API URL used for locally stored image links |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_SECRET_KEY` | no | Enables Cloudinary image hosting |
| `PAYSTACK_SECRET_KEY` | no | Enables "Pay online" (use `sk_test_...` while testing) |
| `CURRENCY` | no | Payment currency (default `NGN`) |
| `SEED_DOCTOR_PASSWORD` | no | Password for doctors created by `npm run seed` |
| `AUTO_SEED` | no | `true` loads the sample doctors on start when there are none (set by `render.yaml`) |

## Tests

```bash
npm test
```

Runs unit tests and an end-to-end API test (admin → add doctor → patient signup → booking →
double-booking protection → doctor completes → dashboards → cancellation). The end-to-end test
downloads a temporary in-memory MongoDB the first time it runs.

## Go live

One Vercel project serves everything from the same domain:

| URL | What |
| --- | --- |
| `https://<your-site>.vercel.app/` | Patient website |
| `https://<your-site>.vercel.app/admin` | Admin & doctor dashboard |
| `https://<your-site>.vercel.app/api/...` | Backend API (serverless function in `api/index.js`) |

`vercel.json` installs and builds everything. On the first request, the 15 sample doctors are
loaded automatically (login password `Doctor@12345` unless `SEED_DOCTOR_PASSWORD` is set).

**The only setup needed** (one time, ~2 minutes):

1. **MongoDB Atlas** (https://cloud.mongodb.com):
   - *Network Access* → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`).
   - *Connect* → *Drivers* → copy the connection string and put in your password.
2. **Vercel** → your project → *Settings* → *Environment Variables*, add:
   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | the connection string from step 1 |
   | `ADMIN_EMAIL` | email for the admin dashboard login |
   | `ADMIN_PASSWORD` | password for the admin dashboard login |

   Optional: `JWT_SECRET` (any long random text; otherwise derived from `MONGODB_URI`),
   `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_SECRET_KEY` (otherwise uploaded photos
   are stored in the database), `PAYSTACK_SECRET_KEY` (enables "Pay online").
3. *Deployments* → latest production deployment → **Redeploy**.

If something is missing, the website shows a message saying exactly what to fix.

### Other hosting options
- **Render** (backend only): `render.yaml` is a ready Blueprint (*New + → Blueprint*). Then build the
  websites with `VITE_BACKEND_URL` set to the Render URL (and `ADMIN_BASE=/` for the dashboard if
  it gets its own domain).
- **Any Node server**: `cd backend && npm start` with the variables from `backend/.env.example`.

## API overview

| Method | Endpoint | Auth header |
| --- | --- | --- |
| POST | `/api/user/register`, `/api/user/login` | - |
| GET | `/api/user/get-profile`, `/api/user/appointments` | `token` |
| POST | `/api/user/update-profile`, `/api/user/book-appointment`, `/api/user/cancel-appointment`, `/api/user/payment-paystack`, `/api/user/verify-paystack` | `token` |
| GET | `/api/doctor/list` | - |
| POST | `/api/doctor/login` | - |
| GET | `/api/doctor/appointments`, `/api/doctor/dashboard`, `/api/doctor/profile` | `dtoken` |
| POST | `/api/doctor/complete-appointment`, `/api/doctor/cancel-appointment`, `/api/doctor/update-profile`, `/api/doctor/change-availability` | `dtoken` |
| POST | `/api/admin/login` | - |
| GET | `/api/admin/all-doctors`, `/api/admin/appointments`, `/api/admin/dashboard` | `atoken` |
| POST | `/api/admin/add-doctor`, `/api/admin/change-availability`, `/api/admin/delete-doctor`, `/api/admin/cancel-appointment` | `atoken` |
