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
import { fetchTripState, saveTripState } from '@/lib/api'
import type {
  Activity,
  Expense,
  GalleryImage,
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
}

interface TripContextValue {
  trip: TripInfo
  schedule: ScheduleActivity[]
  activities: Activity[]
  expenses: Expense[]
  tasks: Task[]
  gallery: GalleryImage[]
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
  totalSpent: number
  remainingBudget: number
  progress: number
}

const TripContext = createContext<TripContextValue | null>(null)

function loadLocal(): TripState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)
  const skipSave = useRef(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const remote = await fetchTripState()
        if (cancelled) return
        setState({
          trip: { ...emptyTrip, ...remote.trip },
          schedule: remote.schedule || [],
          activities: remote.activities || [],
          expenses: remote.expenses || [],
          tasks: remote.tasks || [],
          gallery: remote.gallery || [],
        })
        setSynced(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
      } catch {
        if (cancelled) return
        setState(loadLocal())
        setSynced(false)
      } finally {
        if (!cancelled) {
          setLoading(false)
          skipSave.current = false
        }
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loading || skipSave.current) return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await saveTripState(state)
        setSynced(true)
      } catch {
        setSynced(false)
      }
    }, 500)

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
    setState((s) => ({
      ...s,
      gallery: s.gallery.filter((g) => g.id !== id),
    }))
  }, [])

  const totalSpent = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    [state.expenses]
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
    totalSpent,
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
