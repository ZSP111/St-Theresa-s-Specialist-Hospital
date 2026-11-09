import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// The production build is served at /admin on the same domain as the patient website.
// Set ADMIN_BASE=/ to build it for its own domain instead.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.ADMIN_BASE || '/admin/') : '/',
}))
