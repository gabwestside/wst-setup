import { createRoot } from 'react-dom/client'
import { AppToastProvider } from './components/ui/ToastProvider'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <AppToastProvider>
    <App />
  </AppToastProvider>
)
