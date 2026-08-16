import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './routes/Index.jsx'

const DRILLS = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5']

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {DRILLS.map((d) => (
          <Route key={d} path={`/${d}`} element={<div>{d} — not built yet</div>} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
