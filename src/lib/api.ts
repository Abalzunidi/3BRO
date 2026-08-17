import type { TripState } from '@/types'

const MANTLE_NS = import.meta.env.VITE_MANTLE_NS || '3bro-trip-msam7z70'
const MANTLE_KEY = import.meta.env.VITE_MANTLE_KEY || '4e5ea35f4d4f88fa3a5a5de0de7d18ccce6c753c5da7fffff92336a3b01eda2e'
const MANTLE_URL = `https://mantledb.sh/v2/${MANTLE_NS}/state`

const emptyState: TripState = {
  trip: {
    name: '',
    destination: '',
    travelDate: '',
    returnDate: '',
    budget: 0,
  },
  schedule: [],
  activities: [],
  expenses: [],
  tasks: [],
  gallery: [],
  members: [],
  payments: [],
}

function normalize(data: Partial<TripState> | null | undefined): TripState {
  return {
    trip: { ...emptyState.trip, ...(data?.trip || {}) },
    schedule: data?.schedule || [],
    activities: data?.activities || [],
    expenses: data?.expenses || [],
    tasks: data?.tasks || [],
    gallery: data?.gallery || [],
    members: data?.members || [],
    payments: data?.payments || [],
  }
}

export async function fetchTripState(): Promise<TripState> {
  const res = await fetch(MANTLE_URL, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to load trip data')
  return normalize(await res.json())
}

export async function saveTripState(state: TripState): Promise<TripState> {
  const payload = normalize(state)
  const res = await fetch(MANTLE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Mantle-Key': MANTLE_KEY,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to save trip data')
  return payload
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(MANTLE_URL, { headers: { Accept: 'application/json' } })
    return res.ok
  } catch {
    return false
  }
}
