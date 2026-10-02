import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installGlobalHandlers } from '@/lib/observability'

// CC-05: an error boundary only sees errors thrown during render. These catch
// a rejected promise in an event handler and a throw inside a timer, which
// previously vanished without a trace.
installGlobalHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
