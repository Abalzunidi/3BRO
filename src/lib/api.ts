import type { TripState } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchTripState(): Promise<TripState> {
  const res = await fetch(`${API_BASE}/state`)
  if (!res.ok) throw new Error('Failed to load trip data')
  return res.json()
}

export async function saveTripState(state: TripState): Promise<TripState> {
  const res = await fetch(`${API_BASE}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error('Failed to save trip data')
  return res.json()
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) return false
    const data = await res.json()
    return data.ok === true && data.db === 'connected'
  } catch {
    return false
  }
}
