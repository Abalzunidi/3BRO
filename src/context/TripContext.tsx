import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { generateId } from '@/lib/utils'
import { fetchTripState, saveTripState, deleteMedia, stripMedia, hydrateMedia } from '@/lib/api'
import { checkForNewBuild } from '@/lib/app-update'
import type {
  Activity,
  Expense,
  GalleryImage,
  Member,
  Payment,
  ScheduleActivity,
  Task,
  TripInfo,
  TripState,
} from '@/types'

const STORAGE_KEY = '3bro-trip-data'

const emptyTrip: TripInfo = {
  name: '',
  destination: '',
  travelDate: '',
  returnDate: '',
  budget: 0,
}

const defaultState: TripState = {
  trip: emptyTrip,
  schedule: [],
  activities: [],
  expenses: [],
  tasks: [],
  gallery: [],
  members: [],
  payments: [],
}

interface TripContextValue {
  trip: TripInfo
  schedule: ScheduleActivity[]
  activities: Activity[]
  expenses: Expense[]
  tasks: Task[]
  gallery: GalleryImage[]
  members: Member[]
  payments: Payment[]
  loading: boolean
  synced: boolean
  updateTrip: (info: Partial<TripInfo>) => void
  addScheduleActivity: (activity: Omit<ScheduleActivity, 'id' | 'order'>) => void
  updateScheduleActivity: (id: string, data: Partial<ScheduleActivity>) => void
  deleteScheduleActivity: (id: string) => void
  reorderSchedule: (ids: string[]) => void
  addActivity: (activity: Omit<Activity, 'id'>) => void
  updateActivity: (id: string, data: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  deleteExpense: (id: string) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  addGalleryImages: (images: Omit<GalleryImage, 'id'>[]) => void
  deleteGalleryImage: (id: string) => void
  toggleGalleryLike: (id: string, memberId: string) => void
  addMember: (member: Omit<Member, 'id'>) => Member
  updateMember: (id: string, data: Partial<Member>) => void
  deleteMember: (id: string) => void
  addPayment: (payment: Omit<Payment, 'id'>) => void
  adjustPayment: (id: string, delta: number) => void
  setPaymentAmount: (id: string, amount: number) => void
  deletePayment: (id: string) => void
  refresh: () => Promise<boolean>
  totalPaid: number
  totalSpent: number
  remainingBudget: number
  progress: number
}

const TripContext = createContext<TripContextValue | null>(null)

function loadLocal(): TripState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<TripState>
    return { ...defaultState, ...parsed, members: parsed.members || [], payments: parsed.payments || [] }
  } catch {
    return defaultState
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)
  const skipSave = useRef(true)
  const dirtyRef = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const persistLocal = (next: TripState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripMedia(next)))
    } catch {
      // QuotaExceeded: keep in-memory state; remote save still runs.
    }
  }

  const applyRemote = useCallback((remote: TripState, force = false) => {
    if (!force && dirtyRef.current) return
    const next: TripState = {
      trip: { ...emptyTrip, ...remote.trip },
      schedule: remote.schedule || [],
      activities: remote.activities || [],
      expenses: remote.expenses || [],
      tasks: remote.tasks || [],
      gallery: remote.gallery || [],
      members: remote.members || [],
      payments: remote.payments || [],
    }
    const same = JSON.stringify(next) === JSON.stringify(stateRef.current)
    if (same) {
      setSynced(true)
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    skipSave.current = true
    dirtyRef.current = false
    setState(next)
    stateRef.current = next
    persistLocal(next)
    setSynced(true)
  }, [])

  const refresh = useCallback(async () => {
    try {
      if (dirtyRef.current) {
        await saveTripState(stateRef.current)
        dirtyRef.current = false
      }
      const remote = await fetchTripState()
      applyRemote(remote, true)
      await navigator.serviceWorker?.getRegistration()?.then((reg) => reg?.update())
      await checkForNewBuild()
      return true
    } catch {
      setSynced(false)
      return false
    }
  }, [applyRemote])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const remote = await fetchTripState()
        if (cancelled) return
        applyRemote(remote, true)
      } catch {
        if (cancelled) return
        setState(await hydrateMedia(loadLocal()))
        setSynced(false)
      } finally {
        if (!cancelled) {
          setLoading(false)
          skipSave.current = false
        }
      }
    }

    init()

    const poll = setInterval(async () => {
      if (document.hidden) return
      try {
        const remote = await fetchTripState()
        if (cancelled) return
        applyRemote(remote)
      } catch {
        setSynced(false)
      }
    }, 8000)

    return () => {
      cancelled = true
      clearInterval(poll)
    }
  }, [applyRemote])

  useEffect(() => {
    if (loading) return
    if (skipSave.current) {
      skipSave.current = false
      return
    }

    dirtyRef.current = true
    persistLocal(state)

    if (saveTimer.current) clearTimeout(saveTimer.current)
    const snapshot = state
    saveTimer.current = setTimeout(async () => {
      if (skipSave.current) return
      // Avoid writing a stale empty snapshot over newer remote data
      if (JSON.stringify(snapshot) !== JSON.stringify(stateRef.current)) return
      try {
        await saveTripState(stateRef.current)
        dirtyRef.current = false
        setSynced(true)
      } catch {
        setSynced(false)
      }
    }, 600)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, loading])

  const updateTrip = useCallback((info: Partial<TripInfo>) => {
    setState((s) => ({ ...s, trip: { ...s.trip, ...info } }))
  }, [])

  const addScheduleActivity = useCallback((activity: Omit<ScheduleActivity, 'id' | 'order'>) => {
    setState((s) => ({
      ...s,
      schedule: [...s.schedule, { ...activity, id: generateId(), order: s.schedule.length }],
    }))
  }, [])

  const updateScheduleActivity = useCallback((id: string, data: Partial<ScheduleActivity>) => {
    setState((s) => ({
      ...s,
      schedule: s.schedule.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }))
  }, [])

  const deleteScheduleActivity = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      schedule: s.schedule.filter((a) => a.id !== id).map((a, i) => ({ ...a, order: i })),
    }))
  }, [])

  const reorderSchedule = useCallback((ids: string[]) => {
    setState((s) => {
      const map = new Map(s.schedule.map((a) => [a.id, a]))
      return {
        ...s,
        schedule: ids.map((id, i) => ({ ...map.get(id)!, order: i })),
      }
    })
  }, [])

  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    setState((s) => ({
      ...s,
      activities: [...s.activities, { ...activity, id: generateId() }],
    }))
  }, [])

  const updateActivity = useCallback((id: string, data: Partial<Activity>) => {
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }))
  }, [])

  const deleteActivity = useCallback((id: string) => {
    void deleteMedia('activity', id)
    setState((s) => ({
      ...s,
      activities: s.activities.filter((a) => a.id !== id),
    }))
  }, [])

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setState((s) => ({
      ...s,
      expenses: [...s.expenses, { ...expense, id: generateId() }],
    }))
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      expenses: s.expenses.filter((e) => e.id !== id),
    }))
  }, [])

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...task, id: generateId() }],
    }))
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
    }))
  }, [])

  const addGalleryImages = useCallback((images: Omit<GalleryImage, 'id'>[]) => {
    setState((s) => ({
      ...s,
      gallery: [...s.gallery, ...images.map((img) => ({ ...img, id: generateId() }))],
    }))
  }, [])

  const deleteGalleryImage = useCallback((id: string) => {
    void deleteMedia('gallery', id)
    setState((s) => ({
      ...s,
      gallery: s.gallery.filter((g) => g.id !== id),
    }))
  }, [])

  const toggleGalleryLike = useCallback((id: string, memberId: string) => {
    if (!memberId) return
    setState((s) => ({
      ...s,
      gallery: s.gallery.map((g) => {
        if (g.id !== id) return g
        const likedBy = g.likedBy || []
        return {
          ...g,
          likedBy: likedBy.includes(memberId)
            ? likedBy.filter((m) => m !== memberId)
            : [...likedBy, memberId],
        }
      }),
    }))
  }, [])

  const addMember = useCallback((member: Omit<Member, 'id'>) => {
    const next: Member = { ...member, id: generateId() }
    setState((s) => ({ ...s, members: [...s.members, next] }))
    return next
  }, [])

  const updateMember = useCallback((id: string, data: Partial<Member>) => {
    setState((s) => ({
      ...s,
      members: s.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }))
  }, [])

  const deleteMember = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
    }))
  }, [])

  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    setState((s) => ({
      ...s,
      payments: [...s.payments, { ...payment, id: generateId(), amount: Math.max(0, payment.amount) }],
    }))
  }, [])

  const adjustPayment = useCallback((id: string, delta: number) => {
    setState((s) => ({
      ...s,
      payments: s.payments.map((p) =>
        p.id === id ? { ...p, amount: Math.max(0, Math.round((p.amount + delta) * 100) / 100) } : p
      ),
    }))
  }, [])

  const setPaymentAmount = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      payments: s.payments.map((p) =>
        p.id === id ? { ...p, amount: Math.max(0, Math.round(amount * 100) / 100) } : p
      ),
    }))
  }, [])

  const deletePayment = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      payments: s.payments.filter((p) => p.id !== id),
    }))
  }, [])

  const totalSpent = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    [state.expenses]
  )

  const totalPaid = useMemo(
    () => state.payments.reduce((sum, p) => sum + p.amount, 0),
    [state.payments]
  )

  const remainingBudget = useMemo(
    () => state.trip.budget - totalSpent,
    [state.trip.budget, totalSpent]
  )

  const progress = useMemo(() => {
    const all = [...state.schedule, ...state.activities]
    if (all.length === 0 && state.tasks.length === 0) return 0
    const completed = all.filter((a) => a.status === 'completed').length
    const taskDone = state.tasks.filter((t) => t.status === 'completed').length
    const taskTotal = state.tasks.length
    if (all.length === 0) return Math.round((taskDone / taskTotal) * 100)
    if (taskTotal === 0) return Math.round((completed / all.length) * 100)
    return Math.round((completed / all.length) * 70 + (taskDone / taskTotal) * 30)
  }, [state.schedule, state.activities, state.tasks])

  const value: TripContextValue = {
    trip: state.trip,
    schedule: state.schedule,
    activities: state.activities,
    expenses: state.expenses,
    tasks: state.tasks,
    gallery: state.gallery,
    members: state.members,
    payments: state.payments,
    loading,
    synced,
    updateTrip,
    addScheduleActivity,
    updateScheduleActivity,
    deleteScheduleActivity,
    reorderSchedule,
    addActivity,
    updateActivity,
    deleteActivity,
    addExpense,
    deleteExpense,
    addTask,
    updateTask,
    deleteTask,
    addGalleryImages,
    deleteGalleryImage,
    toggleGalleryLike,
    addMember,
    updateMember,
    deleteMember,
    addPayment,
    adjustPayment,
    setPaymentAmount,
    deletePayment,
    refresh,
    totalSpent,
    totalPaid,
    remainingBudget,
    progress,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}
