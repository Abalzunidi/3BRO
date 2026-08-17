import { useState, type FormEvent } from 'react'
import { Delete as DeleteKey, LogIn, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { normalizePin, normalizeUsername } from '@/lib/sections'
import { cn } from '@/lib/utils'

type LoginMode = 'username' | 'code'

export function Login() {
  const { needsSetup, login, setupAdmin } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState<LoginMode>('username')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const submitPin = (value: string) => {
    const code = normalizePin(value)
    setPin(code)
    if (code.length < 4) {
      setError('')
      return
    }
    if (login(code)) {
      toast('Welcome back')
      return
    }
    setError('Wrong code')
    setPin('')
  }

  const handleUsernameLogin = (e: FormEvent) => {
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
    const msg = setupAdmin(name, username, pin)
    if (msg) {
      setError(msg)
      toast(msg, 'error')
      return
    }
    toast('Admin account created')
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="dark fixed inset-0 overflow-y-auto bg-[#0c0b0a] text-foreground flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="3 BRO"
            className="h-48 w-48 object-contain"
          />
          <p className="text-sm text-[#a39888] mt-5">
            {needsSetup ? 'Create the admin login first' : 'Sign in with username or code'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#171411] p-6 shadow-2xl">
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
                <Label htmlFor="admin-username">Username (optional)</Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-pin">Code (4 digits, optional)</Label>
                <Input
                  id="admin-pin"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(normalizePin(e.target.value))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-[0.4em] font-display"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">Add a username, a code, or both.</p>
              {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
              <Button type="submit" className="w-full" size="lg">
                <ShieldCheck className="h-4 w-4" />
                Create admin
              </Button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/40 mb-5">
                <button
                  type="button"
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium touch-manipulation',
                    mode === 'username' ? 'bg-[#f4efe6] text-[#161411]' : 'text-[#a39888]'
                  )}
                  onClick={() => {
                    setMode('username')
                    setError('')
                  }}
                >
                  Username
                </button>
                <button
                  type="button"
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium touch-manipulation',
                    mode === 'code' ? 'bg-[#f4efe6] text-[#161411]' : 'text-[#a39888]'
                  )}
                  onClick={() => {
                    setMode('code')
                    setError('')
                  }}
                >
                  Code
                </button>
              </div>

              {mode === 'username' ? (
                <form onSubmit={handleUsernameLogin} className="space-y-4">
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
              ) : (
                <>
                  <div className="flex justify-center gap-2 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5 rounded-full border',
                          i < pin.length ? 'bg-[#f4efe6] border-[#f4efe6]' : 'border-white/15 bg-white/5'
                        )}
                      />
                    ))}
                  </div>
                  {error ? <p className="text-sm text-destructive text-center mb-3">{error}</p> : null}
                  <div className="grid grid-cols-3 gap-2">
                    {keys.map((key, i) =>
                      key === '' ? (
                        <span key={`empty-${i}`} />
                      ) : (
                        <Button
                          key={key}
                          type="button"
                          variant={key === 'del' ? 'outline' : 'secondary'}
                          className="h-14 text-xl font-display"
                          onClick={() => {
                            if (key === 'del') {
                              setPin((p) => p.slice(0, -1))
                              setError('')
                              return
                            }
                            submitPin(pin + key)
                          }}
                        >
                          {key === 'del' ? <DeleteKey className="h-5 w-5" /> : key}
                        </Button>
                      )
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
