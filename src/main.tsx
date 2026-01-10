import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../design-tokens/design-tokens-complete.css'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find root element')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
