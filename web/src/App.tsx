import './styles/global.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PreviewPage } from './pages/Preview'
import { HomePage } from './pages/Home'
import { SharePage } from './pages/Share'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/preview' element={<PreviewPage />} />
        <Route path='/share' element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  )
}
