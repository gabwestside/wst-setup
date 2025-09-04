import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App'
import PreviewPage from './pages/Preview'
import { AppToastProvider } from './components/ui/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <AppToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/preview' element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  </AppToastProvider>
)
