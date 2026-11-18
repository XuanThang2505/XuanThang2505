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
