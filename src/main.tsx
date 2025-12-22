import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createLogger } from '@/utils/logger'

const logger = createLogger('Main')

logger.info('Initializing Distribook React application')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

logger.info('Application rendered successfully')
