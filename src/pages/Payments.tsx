import { useState } from 'react'
import { Banknote, Minus, Plus, Trash2 } from 'lucide-react'
import { BudgetCard } from '@/components/shared/BudgetCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTrip } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatCurrency } from '@/lib/utils'
import { toWesternDigits } from '@/lib/sections'
import { motion } from 'framer-motion'

export function Payments() {
  const { payments, addPayment, adjustPayment, setPaymentAmount, deletePayment, totalPaid } = useTrip()
  const { canEdit } = useAuth()
  const { toast } = useToast()
  const editable = canEdit('payments')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '' })

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('Name is required', 'error')
      return
    }
    addPayment({
      name: form.name.trim(),
      amount: Number(toWesternDigits(form.amount)) || 0,
    })
    toast('Name added')
    setForm({ name: '', amount: '' })
    setOpen(false)
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Payments"
        description={editable ? 'Who paid, and how much — add or subtract anytime' : 'Who paid, and how much'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BudgetCard title="People" amount={String(payments.length)} icon={Banknote} delay={0} />
        <BudgetCard title="Total paid" amount={formatCurrency(totalPaid)} icon={Banknote} variant="remaining" delay={0.05} />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payments yet"
          description={editable ? 'Add a name and the amount they paid. You can increase or decrease it later.' : 'Payments will show up here when someone adds them.'}
          action={editable ? <Button onClick={() => setOpen(true)}>+ Add name</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {payments.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium truncate">{person.name}</p>
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      deletePayment(person.id)
                      toast('Removed')
                    }}
                    aria-label={`Remove ${person.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editable ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => adjustPayment(person.id, -10)}>
                  -10
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustPayment(person.id, -1)}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  inputMode="decimal"
                  value={person.amount}
                  onChange={(e) => {
                    const n = Number(toWesternDigits(e.target.value))
                    if (e.target.value === '' || Number.isNaN(n)) {
                      setPaymentAmount(person.id, 0)
                      return
                    }
                    setPaymentAmount(person.id, n)
                  }}
                  className="w-28 text-center font-display text-lg font-semibold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustPayment(person.id, 1)}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => adjustPayment(person.id, 10)}>
                  +10
                </Button>
              </div>
              ) : null}
              <p className={editable ? 'text-xs text-muted-foreground mt-2' : 'text-lg font-display font-semibold mt-2'}>{formatCurrency(person.amount)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {editable && <FloatingActionButton onClick={() => setOpen(true)} label="Add name" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add payment</DialogTitle>
            <DialogDescription>Enter the name and how much they paid. You can change it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount paid</Label>
              <Input
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: toWesternDigits(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
