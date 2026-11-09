# ST THERESA'S SPECIALIST HOSPITAL

A full-stack (MERN) appointment booking system for St Theresa's Specialist Hospital.

| App | Folder | Default URL | Who uses it |
| --- | --- | --- | --- |
| Patient website | `frontend/` | http://localhost:5173 | Patients: browse doctors, sign up, book/cancel/pay for appointments, manage profile |
| Dashboard panel | `admin/` | http://localhost:5174 | **Admin**: dashboard, add/remove doctors, toggle availability, view/cancel all appointments.<br>**Doctors**: dashboard & earnings, complete/cancel appointments, edit profile & fees |
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
| `JWT_SECRET` | yes | Long random string used to sign login tokens |
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

## Go live (step by step)

You need three free accounts: **MongoDB Atlas** (database), **Render** (backend API) and
**Vercel** or **Netlify** (websites). Cloudinary (photos) and Paystack (payments) are optional.

### 1. Database - MongoDB Atlas
1. Log in at https://cloud.mongodb.com and open your cluster (or create a free one).
2. **Database Access** → change the database user's password (the old one was exposed in git history).
3. **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`), so Render can connect.
4. **Connect** → *Drivers* → copy the connection string, e.g.
   `mongodb+srv://myuser:<password>@cluster0.abcde.mongodb.net/` and put your password in place of `<password>`.

### 2. Backend API - Render
1. Sign up at https://render.com with your GitHub account.
2. **New +** → **Blueprint** → choose this repository (branch `main`). Render reads `render.yaml`.
3. Fill in the values it asks for:
   | Setting | What to enter |
   | --- | --- |
   | `MONGODB_URI` | the connection string from step 1 |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the login you want for the admin panel |
   | `FRONTEND_URL` | your patient website URL, e.g. `https://st-theresa-s-specialist-hospital.vercel.app` |
   | `SEED_DOCTOR_PASSWORD` | password for the 15 sample doctors (blank = `Doctor@12345`) |
   | `CLOUDINARY_*` | your Cloudinary keys - **recommended**, otherwise photos uploaded later are lost when Render restarts |
   | `PAYSTACK_SECRET_KEY` | optional, enables "Pay online" |
4. Click **Apply**. After a few minutes you get a URL like `https://st-theresas-api.onrender.com`.
   Opening it should show *"ST THERESA'S SPECIALIST HOSPITAL API is running"*, and
   `/api/doctor/list` should list the 15 sample doctors (loaded automatically on first start).

The free Render plan sleeps after 15 minutes without visitors, so the first request after a pause takes ~30-60 seconds.

### 3. Websites - Vercel
1. Patient website: in your Vercel project whose Root Directory is the repository root, go to
   **Settings → Environment Variables** and add `VITE_BACKEND_URL` = your Render URL. Redeploy.
2. Dashboard panel: **Add New → Project** → this repository → **Root Directory** `admin` →
   add the same `VITE_BACKEND_URL` → Deploy.
3. Delete any extra Vercel projects connected to this repository.

(On Netlify instead: set base directory `frontend` or `admin`, build command `npm run build`,
publish directory `dist`, and the same `VITE_BACKEND_URL`.)

### 4. Check it
Open the patient website → doctors appear → create an account → book an appointment.
Open the dashboard → log in as admin → the booking appears.

## Deployment notes

- `vercel.json` at the root builds the patient website from the repository root; SPA fallback rules
  are included (`vercel.json`, `public/_redirects` for Netlify).
- Set `VITE_BACKEND_URL` **before** building - it is baked into the website at build time.
- Use Cloudinary in production: Render's disk is wiped on every restart. Sample doctor photos are
  served from the repository and are not affected.

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
