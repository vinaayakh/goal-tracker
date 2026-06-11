import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { HistoryPage } from './pages/HistoryPage'
import { GoalDetail } from './pages/GoalDetail'
import { GoalFormModal } from './components/forms/GoalFormModal'
import { useStore } from './store/useStore'

function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated)
  if (!hydrated) {
    return (
      <div className="fixed inset-0 grid place-items-center">
        <div className="size-10 rounded-full border-2 border-white/15 border-t-violet-400 animate-spin" />
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  return (
    <HydrationGate>
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/goal/:id" element={<GoalDetail />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
      <GoalFormModal />
    </HydrationGate>
  )
}
