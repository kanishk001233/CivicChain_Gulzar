import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackTitle="Application Error"
      fallbackMessage="A fatal UI error occurred. Retry to recover the app."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
