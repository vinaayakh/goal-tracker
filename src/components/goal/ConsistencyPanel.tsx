import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Flame, Trophy, Activity } from 'lucide-react'
import type { Goal } from '../../types'
import type { AccentTheme } from '../../lib/theme'
import { useStore } from '../../store/useStore'
import { weeklyConsistency, rollingRate } from '../../lib/consistency'

interface Props {
  goal: Goal
  accent: AccentTheme
  streak: { current: number; longest: number }
}

export function ConsistencyPanel({ goal, accent, streak }: Props) {
  const completions = useStore((s) => s.completions)

  const weeks = useMemo(() => weeklyConsistency(goal, completions, 12), [goal, completions])
  const rate7 = useMemo(() => rollingRate(goal, completions, 7), [goal, completions])

  const hasData = completions.some((c) => c.goalId === goal.id)

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <Stat icon={<Flame size={15} />} color="#fb923c" value={`${streak.current}d`} label="Current streak" />
        <Stat icon={<Trophy size={15} />} color="#fbbf24" value={`${streak.longest}d`} label="Best streak" />
        <Stat icon={<Activity size={15} />} color={accent.solid} value={`${rate7}%`} label="Last 7 days" />
      </div>

      {!hasData ? (
        <div className="grid place-items-center h-44 text-center text-ink-soft text-sm">
          <div>
            <div className="text-3xl mb-2">📊</div>
            Check this in a few times to see your weekly consistency.
          </div>
        </div>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`bar-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent.solid2} />
                  <stop offset="100%" stopColor={accent.solid} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#6b7088', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#6b7088', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: 'rgba(17,18,29,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f4f5fb',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#aab0c6' }}
                wrapperStyle={{ outline: 'none' }}
                labelFormatter={(label) => `Week of ${label}`}
                formatter={(_v, _n, item) => {
                  const p = item?.payload as { rate: number; done: number; expected: number }
                  return [`${p.rate}%  (${p.done}/${p.expected})`, 'Completed']
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} animationDuration={700} maxBarSize={26}>
                {weeks.map((w) => (
                  <Cell
                    key={w.weekStart}
                    fill={w.expected === 0 ? 'rgba(255,255,255,0.06)' : `url(#bar-${goal.id})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ReactNode
  color: string
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-lg font-bold text-ink">{value}</span>
      </div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  )
}
