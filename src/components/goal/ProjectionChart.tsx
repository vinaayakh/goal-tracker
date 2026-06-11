import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts'
import type { Projection } from '../../lib/projection'
import { VERDICT_META } from '../../lib/projection'
import type { AccentTheme } from '../../lib/theme'
import { dayKey, prettyDateShort, parseDay } from '../../lib/date'
import { addDays } from 'date-fns'
import { Chip } from '../ui/Chip'

interface Props {
  projection: Projection
  startDate: string
  accent: AccentTheme
}

export function ProjectionChart({ projection, startDate, accent }: Props) {
  const verdict = VERDICT_META[projection.verdict]
  const fmt = (idx: number) => prettyDateShort(dayKey(addDays(parseDay(startDate), idx)))

  if (!projection.hasData) {
    return (
      <div className="grid place-items-center h-56 text-center text-ink-soft text-sm">
        <div>
          <div className="text-3xl mb-2">📈</div>
          {projection.type === 'metric'
            ? 'Log a few values to see your trend & projection.'
            : 'Complete this goal a few times to see your projection.'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Chip color={verdict.accent}>{verdict.label}</Chip>
        {projection.targetValue !== undefined && (
          <Chip color="#6b7088">
            Target: {projection.targetValue}
            {projection.unit}
          </Chip>
        )}
        {projection.type === 'metric' && projection.projectedDate && (
          <Chip color={accent.solid}>
            Trend hits target ≈ {prettyDateShort(projection.projectedDate)}
          </Chip>
        )}
        {projection.projectedValue !== undefined && projection.targetDate && (
          <Chip color={accent.solid}>
            Projected by end: {projection.projectedValue}
            {projection.unit}
          </Chip>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projection.points} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="dayIndex"
              type="number"
              domain={[projection.startDayIndex, projection.endDayIndex]}
              tickFormatter={fmt}
              tick={{ fill: '#6b7088', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: '#6b7088', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={42}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(17,18,29,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#f4f5fb',
                fontSize: 12,
              }}
              labelStyle={{ color: '#aab0c6' }}
              wrapperStyle={{ outline: 'none' }}
              labelFormatter={(idx) => fmt(idx as number)}
              formatter={(v, name) => [`${v}${projection.unit}`, labelFor(String(name))]}
            />
            <Legend
              formatter={(v) => <span style={{ color: '#aab0c6', fontSize: 12 }}>{labelFor(v)}</span>}
              iconType="plainline"
            />
            {projection.targetValue !== undefined && (
              <ReferenceLine
                y={projection.targetValue}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="2 4"
              />
            )}
            <Line
              type="monotone"
              dataKey="required"
              stroke="#6b7088"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
              animationDuration={700}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={accent.solid}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={false}
              connectNulls
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={accent.solid2}
              strokeWidth={3}
              dot={{ r: 3, fill: accent.solid2, strokeWidth: 0 }}
              connectNulls
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function labelFor(name: string): string {
  switch (name) {
    case 'actual':
      return 'Actual'
    case 'projected':
      return 'If trend continues'
    case 'required':
      return 'Pace needed'
    default:
      return name
  }
}
