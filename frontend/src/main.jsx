/**
 * InFinance — main.jsx
 * App entry point: sets up styles, i18n, and mounts the root App.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Styles — import order matters: tokens → animations → components
import './styles/index.css'
import './styles/animations.css'
import './styles/components.css'

// i18n (must be imported early)
import './i18n'

// App
import { App } from './app/App'

// Mount
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
