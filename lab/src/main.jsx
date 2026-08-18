import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './routes/Index.jsx'
import V0 from './routes/v0/V0.jsx'
import V1 from './routes/v1/V1.jsx'
import V2 from './routes/v2/index.jsx'
import V3 from './routes/v3/V3.jsx'
import V4 from './routes/v4/V4.jsx'
import V5 from './routes/v5/V5.jsx'
import V6 from './routes/v6/V6.jsx'
import V7 from './routes/v7/V7.jsx'

const DRILLS = []

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/v0" element={<V0 />} />
        <Route path="/v1" element={<V1 />} />
        <Route path="/v2" element={<V2 />} />
        <Route path="/v3" element={<V3 />} />
        <Route path="/v4" element={<V4 />} />
        <Route path="/v5" element={<V5 />} />
        <Route path="/v6" element={<V6 />} />
        <Route path="/v7" element={<V7 />} />
        {DRILLS.map((d) => (
          <Route key={d} path={`/${d}`} element={<div>{d} — not built yet</div>} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
