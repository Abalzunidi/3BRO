import { useState, type FormEvent } from 'react'
import { LogIn, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { normalizeUsername } from '@/lib/sections'

export function Login() {
  const { needsSetup, login, setupAdmin } = useAuth()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    const user = username.trim()
    if (!user) {
      setError('Enter your username')
      return
    }
    if (login(user)) {
      toast('Welcome back')
      return
    }
    setError('Wrong username')
  }

  const handleSetup = (e: FormEvent) => {
    e.preventDefault()
    const msg = setupAdmin(name, username)
    if (msg) {
      setError(msg)
      toast(msg, 'error')
      return
    }
    toast('Admin account created')
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="3bro" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
          <h1 className="font-display text-2xl font-bold mt-4">3bro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {needsSetup ? 'Create the admin username first' : 'Enter the username the admin gave you'}
          </p>
        </div>

        {needsSetup ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Admin name</Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!username || username === normalizeUsername(name)) {
                    setUsername(normalizeUsername(e.target.value))
                  }
                }}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                dir="auto"
              />
            </div>
            {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              <ShieldCheck className="h-4 w-4" />
              Create admin
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="username"
                autoComplete="username"
                autoFocus
                dir="auto"
                className="h-12"
              />
            </div>
            {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="h-4 w-4" />
              Enter
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
