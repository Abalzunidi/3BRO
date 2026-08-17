import { useState, type FormEvent } from 'react'
import { Delete as DeleteKey, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { normalizePin } from '@/lib/sections'

export function Login() {
  const { needsSetup, login, setupAdmin } = useAuth()
  const { toast } = useToast()
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
    setError('Wrong number')
    setPin('')
  }

  const handleSetup = (e: FormEvent) => {
    e.preventDefault()
    const msg = setupAdmin(name, pin)
    if (msg) {
      setError(msg)
      toast(msg, 'error')
      return
    }
    toast('Admin account created')
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="3bro" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
          <h1 className="font-display text-2xl font-bold mt-4">3bro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {needsSetup ? 'Create the admin number first' : 'Enter the number the admin gave you'}
          </p>
        </div>

        {needsSetup ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Admin name</Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pin">Admin number (4 digits)</Label>
              <Input
                id="admin-pin"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(normalizePin(e.target.value))}
                placeholder="••••"
                className="text-center text-2xl tracking-[0.4em] font-display"
              />
            </div>
            {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              <ShieldCheck className="h-4 w-4" />
              Create admin
            </Button>
          </form>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    i < pin.length ? 'bg-primary border-primary' : 'border-border bg-muted'
                  }`}
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
      </div>
    </div>
  )
}
