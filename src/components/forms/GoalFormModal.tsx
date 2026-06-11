import { useEffect, useState } from 'react'
import { Plus, X, Target, LineChart } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Field, TextInput, TextArea, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { useUI } from '../../store/useUI'
import { useStore } from '../../store/useStore'
import type { NewGoalInput } from '../../store/useStore'
import type { AccentKey, GoalType, Recurrence } from '../../types'
import { ACCENTS, ACCENT_KEYS } from '../../lib/theme'
import { today } from '../../lib/date'
import { cn } from '../../lib/cn'

const ICONS = ['🎯', '💻', '🏃', '📚', '💪', '🧘', '💰', '🎨', '🎸', '🌱', '🍎', '✍️', '🚀', '😴', '💧', '🧠']

interface SubtaskDraft {
  title: string
  recurrence: Recurrence
}

const empty: NewGoalInput = {
  title: '',
  description: '',
  type: 'habit',
  accent: 'violet',
  icon: '🎯',
  startDate: today(),
  endDate: undefined,
  subtasks: [],
  metric: { unit: 'kg', startValue: 0, targetValue: 0, direction: 'decrease' },
}

export function GoalFormModal() {
  const formGoalId = useUI((s) => s.formGoalId)
  const closeForm = useUI((s) => s.closeForm)
  const addGoal = useStore((s) => s.addGoal)
  const updateGoal = useStore((s) => s.updateGoal)
  const goals = useStore((s) => s.goals)

  const open = formGoalId !== undefined
  const editing = typeof formGoalId === 'string'

  const [form, setForm] = useState<NewGoalInput>(empty)
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([])
  const [newSub, setNewSub] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      const g = goals.find((x) => x.id === formGoalId)
      if (g) {
        setForm({
          title: g.title,
          description: g.description ?? '',
          type: g.type,
          accent: g.accent,
          icon: g.icon,
          startDate: g.startDate,
          endDate: g.endDate,
          subtasks: g.subtasks.map((s) => ({ title: s.title, recurrence: s.recurrence })),
          metric: g.metric ?? empty.metric,
        })
        setSubtasks(g.subtasks.map((s) => ({ title: s.title, recurrence: s.recurrence })))
      }
    } else {
      setForm(empty)
      setSubtasks([])
    }
    setNewSub('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formGoalId])

  const set = <K extends keyof NewGoalInput>(k: K, v: NewGoalInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setMetric = (patch: Partial<NonNullable<NewGoalInput['metric']>>) =>
    setForm((f) => ({ ...f, metric: { ...f.metric!, ...patch } }))

  const addSub = () => {
    const t = newSub.trim()
    if (!t) return
    setSubtasks((s) => [...s, { title: t, recurrence: 'daily' }])
    setNewSub('')
  }

  const canSave =
    form.title.trim().length > 0 &&
    (form.type === 'habit' ||
      (form.metric!.startValue !== form.metric!.targetValue))

  const save = () => {
    if (!canSave) return
    const payload: NewGoalInput = {
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      subtasks,
      metric:
        form.type === 'metric'
          ? {
              ...form.metric!,
              direction:
                form.metric!.targetValue < form.metric!.startValue ? 'decrease' : 'increase',
            }
          : undefined,
    }
    if (editing) updateGoal(formGoalId as string, payload)
    else addGoal(payload)
    closeForm()
  }

  return (
    <Modal open={open} onClose={closeForm} title={editing ? 'Edit goal' : 'New goal'}>
      <div className="space-y-4">
        {/* Type segmented */}
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { k: 'habit', label: 'Habit', icon: Target, desc: 'Recurring actions' },
              { k: 'metric', label: 'Metric', icon: LineChart, desc: 'Track a number' },
            ] as { k: GoalType; label: string; icon: typeof Target; desc: string }[]
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => set('type', t.k)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors',
                form.type === t.k
                  ? 'border-violet-400/50 bg-violet-500/10'
                  : 'border-white/10 bg-white/4 hover:bg-white/8',
              )}
            >
              <t.icon size={20} className={form.type === t.k ? 'text-violet-300' : 'text-ink-soft'} />
              <span>
                <span className="block text-sm font-medium text-ink">{t.label}</span>
                <span className="block text-[11px] text-ink-faint">{t.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <Field label="Title">
          <TextInput
            value={form.title}
            autoFocus
            placeholder="e.g. Lose 5 kilograms"
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>

        <Field label="Description" hint="Optional">
          <TextArea
            value={form.description}
            placeholder="What does success look like?"
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        {/* Icon picker */}
        <Field label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => set('icon', ic)}
                className={cn(
                  'grid place-items-center size-9 rounded-xl text-lg transition-colors',
                  form.icon === ic ? 'bg-white/15 ring-1 ring-white/30' : 'bg-white/5 hover:bg-white/10',
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </Field>

        {/* Accent picker */}
        <Field label="Accent color">
          <div className="flex gap-2">
            {ACCENT_KEYS.map((k: AccentKey) => (
              <button
                key={k}
                onClick={() => set('accent', k)}
                className={cn(
                  'size-8 rounded-full transition-transform',
                  form.accent === k ? 'ring-2 ring-white/70 scale-110' : 'hover:scale-105',
                )}
                style={{
                  background: `linear-gradient(135deg, ${ACCENTS[k].solid}, ${ACCENTS[k].solid2})`,
                }}
              />
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <TextInput
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
          </Field>
          <Field label="Target date" hint="Optional">
            <TextInput
              type="date"
              value={form.endDate ?? ''}
              onChange={(e) => set('endDate', e.target.value || undefined)}
            />
          </Field>
        </div>

        {/* Metric config */}
        {form.type === 'metric' && (
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white/4 border border-white/8">
            <Field label="Start">
              <TextInput
                type="number"
                step="any"
                value={String(form.metric!.startValue)}
                onChange={(e) => setMetric({ startValue: parseFloat(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Target">
              <TextInput
                type="number"
                step="any"
                value={String(form.metric!.targetValue)}
                onChange={(e) => setMetric({ targetValue: parseFloat(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Unit">
              <TextInput
                value={form.metric!.unit}
                placeholder="kg"
                onChange={(e) => setMetric({ unit: e.target.value })}
              />
            </Field>
          </div>
        )}

        {/* Subtasks */}
        <Field
          label={form.type === 'metric' ? 'Supporting daily habits' : 'Subtasks'}
          hint={
            form.type === 'metric'
              ? 'Optional daily actions that build toward this goal'
              : 'Leave empty for a simple one-tap "Done today" goal'
          }
        >
          <div className="space-y-2">
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 h-10">
                  <span className="flex-1 text-sm text-ink truncate">{s.title}</span>
                  <Select
                    value={s.recurrence}
                    onChange={(e) =>
                      setSubtasks((arr) =>
                        arr.map((x, j) =>
                          j === i ? { ...x, recurrence: e.target.value as Recurrence } : x,
                        ),
                      )
                    }
                    className="!h-7 !w-24 !px-2 text-xs !bg-white/8"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="once">Once</option>
                  </Select>
                </div>
                <button
                  onClick={() => setSubtasks((arr) => arr.filter((_, j) => j !== i))}
                  className="grid place-items-center size-9 rounded-xl text-ink-faint hover:text-rose-300 hover:bg-white/8"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <TextInput
                value={newSub}
                placeholder="Add a sub-task (e.g. Do 20 pushups)"
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSub())}
                className="!h-10"
              />
              <Button variant="soft" size="sm" onClick={addSub} className="!h-10 shrink-0">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </Field>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={closeForm} className="flex-1">
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave} className="flex-1">
            {editing ? 'Save changes' : 'Create goal'}
          </Button>
        </div>
        {form.type === 'metric' && !canSave && form.title.trim() && (
          <p className="text-[11px] text-rose-300 text-center">
            Start and target values must differ.
          </p>
        )}
      </div>
    </Modal>
  )
}
