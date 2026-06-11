import { motion } from 'framer-motion'
import { Sparkles, Plus } from 'lucide-react'
import { PageTransition } from '../components/layout/PageTransition'
import { AnalyticsHeader } from '../components/dashboard/AnalyticsHeader'
import { ActivityOverview } from '../components/dashboard/ActivityOverview'
import { GoalCard } from '../components/dashboard/GoalCard'
import { useActiveGoals } from '../store/hooks'
import { useUI } from '../store/useUI'
import { Button } from '../components/ui/Button'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const goals = useActiveGoals()
  const openCreate = useUI((s) => s.openCreate)

  return (
    <PageTransition>
      <header className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-ink-soft text-sm">
            <Sparkles size={15} className="text-violet-400" />
            {greeting()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Your progress at a glance
          </h1>
        </div>
      </header>

      <AnalyticsHeader />

      <div className="mt-5">
        <ActivityOverview />
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-semibold text-ink">Goals</h2>
        <Button variant="soft" size="sm" onClick={openCreate}>
          <Plus size={16} /> New
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} index={i} />
          ))}
        </div>
      )}
    </PageTransition>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-10 text-center"
    >
      <div className="text-4xl mb-3">🎯</div>
      <h3 className="text-lg font-semibold text-ink">No goals yet</h3>
      <p className="text-ink-soft text-sm mt-1 mb-5">
        Create your first goal and start building momentum.
      </p>
      <div className="flex justify-center">
        <Button onClick={onCreate}>
          <Plus size={18} /> Create a goal
        </Button>
      </div>
    </motion.div>
  )
}
