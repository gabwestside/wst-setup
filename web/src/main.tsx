import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { AppToastProvider } from './components/ToastProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppToastProvider>
      <App />
    </AppToastProvider>
  </React.StrictMode>
)
