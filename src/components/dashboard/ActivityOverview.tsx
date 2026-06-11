import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useDashboard } from '../../store/hooks'
import { prettyDateShort } from '../../lib/date'

export function ActivityOverview() {
  const { activity } = useDashboard()
  const total = activity.reduce((a, b) => a + b.count, 0)

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Activity</h3>
          <p className="text-sm text-ink-soft">Completions over the last 30 days</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-ink">{total}</div>
          <div className="text-xs text-ink-faint">total actions</div>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activity} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => prettyDateShort(d)}
              tick={{ fill: '#6b7088', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
              contentStyle={{
                background: 'rgba(17,18,29,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#f4f5fb',
                fontSize: 12,
              }}
              labelFormatter={(d) => prettyDateShort(d as string)}
              formatter={(v) => [`${v} actions`, '']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="url(#activityFill)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
