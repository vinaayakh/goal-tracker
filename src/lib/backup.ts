import { useStore } from '../store/useStore'
import type { Goal, CompletionLog, MetricLog } from '../types'

interface BackupFile {
  v: 1
  exportedAt: string
  goals: Goal[]
  completions: CompletionLog[]
  metricLogs: MetricLog[]
}

export function exportBackup(): void {
  const { goals, completions, metricLogs } = useStore.getState()
  const data: BackupFile = {
    v: 1,
    exportedAt: new Date().toISOString(),
    goals,
    completions,
    metricLogs,
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `goaltracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string)
        if (
          raw?.v !== 1 ||
          !Array.isArray(raw.goals) ||
          !Array.isArray(raw.completions) ||
          !Array.isArray(raw.metricLogs)
        ) {
          throw new Error('Invalid backup file format.')
        }
        const backup = raw as BackupFile
        useStore.setState({
          goals: backup.goals,
          completions: backup.completions,
          metricLogs: backup.metricLogs,
        })
        resolve()
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse backup file.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsText(file)
  })
}
