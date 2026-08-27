import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/*
 * Relative base, deliberately.
 *
 * Paired with HashRouter in src/App.tsx, this makes the built bundle work when
 * served from any subpath — `.../quora/`, a GitHub Pages project page, a USB
 * stick behind a one-line static server — with no rewrite rule and no rebuild.
 * The artifact loader in src/data.ts already reads import.meta.env.BASE_URL, so
 * the data fetches follow the same base.
 *
 * One thing this does NOT buy: opening dist/index.html directly off the disk.
 * Browsers refuse fetch() against file:// regardless of pathing, and the app
 * loads its artifacts by fetch. Serve the directory instead — see README.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
})
