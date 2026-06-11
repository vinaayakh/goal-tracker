import { create } from 'zustand'

interface UIState {
  /** goal form modal: undefined=closed, null=create new, string=edit goalId */
  formGoalId: string | null | undefined
  openCreate: () => void
  openEdit: (id: string) => void
  closeForm: () => void
}

export const useUI = create<UIState>((set) => ({
  formGoalId: undefined,
  openCreate: () => set({ formGoalId: null }),
  openEdit: (id) => set({ formGoalId: id }),
  closeForm: () => set({ formGoalId: undefined }),
}))
