import type { AppSection, Member } from '@/types'

export const APP_SECTIONS: { id: AppSection; path: string; label: string }[] = [
  { id: 'dashboard', path: '/', label: 'Dashboard' },
  { id: 'schedule', path: '/schedule', label: 'Schedule' },
  { id: 'activities', path: '/activities', label: 'Activities' },
  { id: 'budget', path: '/budget', label: 'Budget' },
  { id: 'payments', path: '/payments', label: 'Payments' },
  { id: 'tasks', path: '/tasks', label: 'Tasks' },
  { id: 'gallery', path: '/gallery', label: 'Gallery' },
]

export const ALL_SECTION_IDS: AppSection[] = APP_SECTIONS.map((s) => s.id)

export function canUploadGallery(member: Member | null | undefined) {
  if (!member) return false
  if (member.role === 'admin') return true
  if (!member.sections.includes('gallery')) return false
  return member.galleryUpload !== false
}

export function pathToSection(pathname: string): AppSection | 'admin' | null {
  if (pathname === '/admin') return 'admin'
  const hit = APP_SECTIONS.find((s) => (s.path === '/' ? pathname === '/' : pathname === s.path || pathname.startsWith(`${s.path}/`)))
  return hit?.id || null
}

export function toWesternDigits(value: string) {
  const eastern = '٠١٢٣٤٥٦٧٨٩'
  const persian = '۰۱۲۳۴۵۶۷۸۹'
  return value
    .split('')
    .map((ch) => {
      const e = eastern.indexOf(ch)
      if (e >= 0) return String(e)
      const p = persian.indexOf(ch)
      if (p >= 0) return String(p)
      return ch
    })
    .join('')
}

export function normalizePin(value: string) {
  return toWesternDigits(value).replace(/\D/g, '').slice(0, 4)
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

export function memberMatchesLogin(member: Member, input: string) {
  const user = normalizeUsername(input)
  if (!user) return false
  if (member.username && normalizeUsername(member.username) === user) return true
  if (normalizeUsername(member.name) === user) return true
  const pin = normalizePin(input)
  return pin.length === 4 && member.pin === pin
}

export function randomUnusedPin(existing: string[]) {
  const used = new Set(existing)
  for (let i = 0; i < 50; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000))
    if (!used.has(pin)) return pin
  }
  return String(Date.now()).slice(-4)
}
