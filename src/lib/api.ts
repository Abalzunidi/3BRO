import type { TripState } from '@/types'
import { idbDelImage, idbGetImage, idbPutImage } from '@/lib/idb-images'

const MANTLE_NS = import.meta.env.VITE_MANTLE_NS || '3bro-trip-msam7z70'
const MANTLE_KEY = import.meta.env.VITE_MANTLE_KEY || '4e5ea35f4d4f88fa3a5a5de0de7d18ccce6c753c5da7fffff92336a3b01eda2e'
const MANTLE_BASE = `https://mantledb.sh/v2/${MANTLE_NS}`
const MANTLE_URL = `${MANTLE_BASE}/state`

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

function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Mantle-Key': MANTLE_KEY,
  }
  if (json) headers['Content-Type'] = 'application/json'
  return headers
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

/** Mantle free tier is 64KB/entry — never put photo data URLs in /state. */
export function stripMedia(state: TripState): TripState {
  const n = normalize(state)
  return {
    ...n,
    gallery: n.gallery.map(({ id, name, createdAt }) => ({ id, name, createdAt, url: '' })),
    activities: n.activities.map((a) => ({
      ...a,
      image: a.image?.startsWith('data:') ? '' : a.image,
    })),
  }
}

async function putMedia(kind: 'gallery' | 'activity', id: string, url: string) {
  const path = `${MANTLE_BASE}/${kind}/${id}`
  const res = await fetch(path, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error('Failed to save image')
  await fetch(`https://mantledb.sh/v2/visibility/${MANTLE_NS}/${kind}/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify({ public_read: true }),
  }).catch(() => undefined)
}

async function getMedia(kind: 'gallery' | 'activity', id: string): Promise<string | null> {
  const res = await fetch(`${MANTLE_BASE}/${kind}/${id}`, { headers: authHeaders() })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return typeof data?.url === 'string' ? data.url : null
}

export async function deleteMedia(kind: 'gallery' | 'activity', id: string) {
  await idbDelImage(`${kind}:${id}`).catch(() => undefined)
  await fetch(`${MANTLE_BASE}/${kind}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).catch(() => undefined)
}

export async function persistMediaFromState(state: TripState) {
  for (const img of state.gallery) {
    if (!img.url?.startsWith('data:')) continue
    const existing = await idbGetImage(`gallery:${img.id}`)
    if (existing === img.url) continue
    await idbPutImage(`gallery:${img.id}`, img.url)
    await putMedia('gallery', img.id, img.url)
  }
  for (const activity of state.activities) {
    if (!activity.image?.startsWith('data:')) continue
    const existing = await idbGetImage(`activity:${activity.id}`)
    if (existing === activity.image) continue
    await idbPutImage(`activity:${activity.id}`, activity.image)
    await putMedia('activity', activity.id, activity.image)
  }
}

export async function hydrateMedia(state: TripState): Promise<TripState> {
  const gallery = await Promise.all(
    state.gallery.map(async (img) => {
      if (img.url) return img
      const local = await idbGetImage(`gallery:${img.id}`)
      if (local) return { ...img, url: local }
      const remote = await getMedia('gallery', img.id)
      if (remote) {
        await idbPutImage(`gallery:${img.id}`, remote)
        return { ...img, url: remote }
      }
      return img
    })
  )
  const activities = await Promise.all(
    state.activities.map(async (activity) => {
      if (activity.image) return activity
      const local = await idbGetImage(`activity:${activity.id}`)
      if (local) return { ...activity, image: local }
      const remote = await getMedia('activity', activity.id)
      if (remote) {
        await idbPutImage(`activity:${activity.id}`, remote)
        return { ...activity, image: remote }
      }
      return activity
    })
  )
  return { ...state, gallery, activities }
}

export async function fetchTripState(): Promise<TripState> {
  const res = await fetch(MANTLE_URL, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load trip data')
  return hydrateMedia(normalize(await res.json()))
}

export async function saveTripState(state: TripState): Promise<TripState> {
  await persistMediaFromState(state)
  const payload = stripMedia(state)
  const res = await fetch(MANTLE_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to save trip data')
  return payload
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(MANTLE_URL, { headers: authHeaders() })
    return res.ok
  } catch {
    return false
  }
}
