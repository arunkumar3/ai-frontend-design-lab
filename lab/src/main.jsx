import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './routes/Index.jsx'
import V0 from './routes/v0/V0.jsx'
import V1 from './routes/v1/V1.jsx'
import V2 from './routes/v2/index.jsx'

const DRILLS = ['v3', 'v4', 'v5']

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/v0" element={<V0 />} />
        <Route path="/v1" element={<V1 />} />
        <Route path="/v2" element={<V2 />} />
        {DRILLS.map((d) => (
          <Route key={d} path={`/${d}`} element={<div>{d} — not built yet</div>} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
