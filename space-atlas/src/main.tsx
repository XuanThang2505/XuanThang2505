import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Stop iOS pinch-zoom / double-tap zoom on the page itself (OrbitControls handles pinch on the canvas).
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Offline + "Add to Home Screen" support. Skipped where service workers are not allowed
// (e.g. inside the claude.ai preview frame) – the app still works, just online-only there.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}

// Self-test hook (only with ?selftest): lets the automated tests check the AR model export.
if (location.search.includes('selftest')) {
  ;(window as unknown as { __arTest: (id: string) => Promise<number> }).__arTest = (id) =>
    import('./worlds/ar').then((m) => m.makePlanetUSDZ(id as 'saturn')).then((b) => b.size)
}
