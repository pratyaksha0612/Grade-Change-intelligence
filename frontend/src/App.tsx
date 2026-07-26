import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ErrorLayout from './layouts/ErrorLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Prediction = lazy(() => import('./pages/Prediction'))
const RootCause = lazy(() => import('./pages/RootCause'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'))
const Timeline = lazy(() => import('./pages/Timeline'))
const DecisionIntelligence = lazy(() => import('./pages/DecisionIntelligence'))
const CorrelationDiscovery = lazy(() => import('./pages/CorrelationDiscovery'))
const Explainability = lazy(() => import('./pages/Explainability'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Loading Module</span>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<ProtectedRoute />} errorElement={<ErrorLayout />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="prediction" element={<Prediction />} />
              <Route path="root-cause" element={<RootCause />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="digital-twin" element={<DigitalTwin />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="decision" element={<DecisionIntelligence />} />
              <Route path="correlations" element={<CorrelationDiscovery />} />
              <Route path="explainability" element={<Explainability />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
