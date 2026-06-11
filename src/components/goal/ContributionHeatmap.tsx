import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { HeatmapData } from '../../lib/heatmap'
import type { AccentTheme } from '../../lib/theme'
import { prettyDate } from '../../lib/date'

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ContributionHeatmap({
  data,
  accent,
}: {
  data: HeatmapData
  accent: AccentTheme
}) {
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null)

  const levelColor = useMemo(
    () => (level: number) => {
      if (level === 0) return 'rgba(255,255,255,0.05)'
      const opacities = [0, 0.3, 0.5, 0.72, 1]
      return hexWithOpacity(accent.solid, opacities[level])
    },
    [accent.solid],
  )

  const cell = 13
  const gap = 3

  return (
    <div className="relative">
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="inline-block min-w-full">
          {/* month labels */}
          <div className="flex" style={{ marginLeft: 26 }}>
            {data.weeks.map((_, wi) => {
              const label = data.monthLabels.find((m) => m.index === wi)
              return (
                <div
                  key={wi}
                  style={{ width: cell + gap }}
                  className="text-[10px] text-ink-faint h-4"
                >
                  {label?.label ?? ''}
                </div>
              )
            })}
          </div>

          <div className="flex">
            {/* weekday labels */}
            <div className="flex flex-col mr-1.5" style={{ gap }}>
              {WEEKDAYS.map((d, i) => (
                <div
                  key={i}
                  style={{ height: cell }}
                  className="text-[10px] text-ink-faint leading-none flex items-center"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* grid */}
            <div className="flex" style={{ gap }}>
              {data.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap }}>
                  {week.map((c, di) => (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: c.inRange ? 1 : 0.25, scale: 1 }}
                      transition={{ delay: Math.min((wi * 7 + di) * 0.001, 0.5), duration: 0.2 }}
                      onMouseEnter={(e) => {
                        const r = (e.target as HTMLElement).getBoundingClientRect()
                        setHover({
                          x: r.left + r.width / 2,
                          y: r.top,
                          text: `${c.count} on ${prettyDate(c.date)}`,
                        })
                      }}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        width: cell,
                        height: cell,
                        borderRadius: 3,
                        background: levelColor(c.level),
                        outline: c.count > 0 ? `1px solid ${hexWithOpacity(accent.solid, 0.25)}` : 'none',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-ink-faint">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            style={{ width: 11, height: 11, borderRadius: 3, background: levelColor(l) }}
          />
        ))}
        <span>More</span>
      </div>

      {hover && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs text-ink glass pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          {hover.text}
        </div>
      )}
    </div>
  )
}

function hexWithOpacity(hex: string, opacity: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}
