import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './routes/Index.jsx'
import { V0, V1, V2, V3, V4, V5, V6 } from './routes/drills.js'

const DRILLS = []

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* No spinner: the capture harness and the live audit both wait for
          network idle, and a fallback that paints would be a frame they could
          catch instead of the page. */}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/v0" element={<V0 />} />
          <Route path="/v1" element={<V1 />} />
          <Route path="/v2" element={<V2 />} />
          <Route path="/v3" element={<V3 />} />
          <Route path="/v4" element={<V4 />} />
          <Route path="/v5" element={<V5 />} />
          <Route path="/v6" element={<V6 />} />
          {DRILLS.map((d) => (
            <Route key={d} path={`/${d}`} element={<div>{d} — not built yet</div>} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
