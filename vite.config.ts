/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base defaults to '/' (local dev, Vercel). The GitHub Pages workflow sets
// BASE_PATH=/india-pyramids/ so assets resolve under the project-page subpath.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
