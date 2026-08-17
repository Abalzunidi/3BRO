import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTrip } from '@/context/TripContext'
import { ALL_SECTION_IDS, APP_SECTIONS, canEditSection, canUploadGallery as memberCanUploadGallery, memberMatchesLogin, normalizePin, normalizeUsername } from '@/lib/sections'
import type { AppSection, Member } from '@/types'

const SESSION_KEY = '3bro-session-id'

interface AuthContextValue {
  member: Member | null
  isAdmin: boolean
  needsSetup: boolean
  login: (value: string) => boolean
  logout: () => void
  setupAdmin: (name: string, username: string, pin: string) => string | null
  canAccess: (section: AppSection | 'admin') => boolean
  canEdit: (section: AppSection) => boolean
  canUploadGallery: boolean
  firstPath: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { members, addMember, loading } = useTrip()
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))

  const member = useMemo(
    () => members.find((m) => m.id === sessionId) || null,
    [members, sessionId]
  )

  useEffect(() => {
    if (loading) return
    if (sessionId && !members.some((m) => m.id === sessionId)) {
      setSessionId(null)
      localStorage.removeItem(SESSION_KEY)
    }
  }, [loading, sessionId, members])

  const persistSession = (id: string | null) => {
    setSessionId(id)
    if (id) localStorage.setItem(SESSION_KEY, id)
    else localStorage.removeItem(SESSION_KEY)
  }

  const login = useCallback(
    (value: string) => {
      const found = members.find((m) => memberMatchesLogin(m, value))
      if (!found) return false
      persistSession(found.id)
      return true
    },
    [members]
  )

  const logout = useCallback(() => persistSession(null), [])

  const setupAdmin = useCallback(
    (name: string, username: string, pin: string) => {
      if (members.length > 0) return 'Admin already exists'
      if (!name.trim()) return 'Name is required'
      const user = normalizeUsername(username)
      const code = normalizePin(pin)
      if (!user && code.length !== 4) return 'Add a username or a 4-digit code'
      if (code && code.length !== 4) return 'Code must be 4 digits'
      const created = addMember({
        name: name.trim(),
        username: user || undefined,
        pin: code,
        role: 'admin',
        sections: [...ALL_SECTION_IDS],
      })
      persistSession(created.id)
      return null
    },
    [members.length, addMember]
  )

  const isAdmin = member?.role === 'admin'
  const needsSetup = !loading && members.length === 0

  const canAccess = useCallback(
    (section: AppSection | 'admin') => {
      if (!member) return false
      if (member.role === 'admin') return true
      if (section === 'admin') return false
      return member.sections.includes(section)
    },
    [member]
  )

  const canUploadGallery = memberCanUploadGallery(member)
  const canEdit = useCallback(
    (section: AppSection) => canEditSection(member, section),
    [member]
  )

  const firstPath = useMemo(() => {
    if (!member) return '/'
    if (member.role === 'admin') return '/'
    const first = APP_SECTIONS.find((s) => member.sections.includes(s.id))
    return first?.path || '/'
  }, [member])

  const value: AuthContextValue = {
    member,
    isAdmin,
    needsSetup,
    login,
    logout,
    setupAdmin,
    canAccess,
    canEdit,
    canUploadGallery,
    firstPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
