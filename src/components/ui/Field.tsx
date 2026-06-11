import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[11px] text-ink-faint mt-1 block">{hint}</span>}
    </label>
  )
}

const base =
  'w-full bg-white/6 border border-white/10 rounded-xl px-3.5 h-11 text-ink outline-none focus:border-white/25 transition-colors placeholder:text-ink-faint'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(base, 'h-auto py-2.5 min-h-[64px] resize-none', props.className)}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(base, 'appearance-none cursor-pointer', props.className)}
    />
  )
}
