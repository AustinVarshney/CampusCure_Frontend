import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// CC-71: initialise translations before the first render.
import '@/i18n'
import { installGlobalHandlers } from '@/lib/observability'
import { registerSW } from 'virtual:pwa-register'

// CC-05: an error boundary only sees errors thrown during render. These catch
// a rejected promise in an event handler and a throw inside a timer, which
// previously vanished without a trace.
installGlobalHandlers()

// CC-70 / CC-41: the service worker. Production builds only - the plugin does
// not build one for `vite dev`, so this is a no-op there.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
