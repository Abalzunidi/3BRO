import { useMemo, useState, type ReactNode } from 'react'
import { Wallet, TrendingDown, PiggyBank, Plus, Trash2, BarChart3 } from 'lucide-react'
import { BudgetCard } from '@/components/shared/BudgetCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTrip } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

const categories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other']

export function Budget() {
  const { trip, expenses, addExpense, deleteExpense, totalSpent, remainingBudget } = useTrip()
  const { canEdit } = useAuth()
  const { toast } = useToast()
  const editable = canEdit('budget')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ item: '', category: 'Food', amount: 0, date: '' })

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [expenses])

  const maxCat = byCategory[0]?.[1] || 1

  const handleSave = () => {
    if (!form.item.trim()) {
      toast('Item name is required', 'error')
      return
    }
    if (!form.amount || form.amount <= 0) {
      toast('Enter a valid amount', 'error')
      return
    }
    addExpense({
      item: form.item,
      category: form.category,
      amount: form.amount,
      date: form.date || new Date().toISOString().slice(0, 10),
    })
    toast('Expense added')
    setForm({ item: '', category: 'Food', amount: 0, date: '' })
    setOpen(false)
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Budget" description="Track your trip expenses" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BudgetCard
          title="Total Budget"
          amount={trip.budget > 0 ? formatCurrency(trip.budget) : '$0'}
          icon={Wallet}
          delay={0}
        />
        <BudgetCard
          title="Total Spent"
          amount={formatCurrency(totalSpent)}
          icon={TrendingDown}
          variant="spent"
          delay={0.05}
        />
        <BudgetCard
          title="Remaining"
          amount={formatCurrency(remainingBudget)}
          icon={PiggyBank}
          variant="remaining"
          delay={0.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Expenses</CardTitle>
            {editable && (
              <Button size="sm" onClick={() => setOpen(true)} className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No expenses yet"
                description={editable ? 'Add your first expense to start tracking your budget.' : 'Expenses will show up here when someone adds them.'}
                className="border-0 bg-transparent py-8"
                action={editable ? <Button onClick={() => setOpen(true)}>+ Add Expense</Button> : undefined}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium pr-4">Item</th>
                      <th className="pb-3 font-medium pr-4">Category</th>
                      <th className="pb-3 font-medium pr-4">Amount</th>
                      <th className="pb-3 font-medium pr-4">Date</th>
                      {editable && <th className="pb-3 font-medium w-10" />}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="py-3 pr-4 font-medium">{expense.item}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-display font-semibold">{formatCurrency(expense.amount)}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{formatDate(expense.date)}</td>
                        {editable && (
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                deleteExpense(expense.id)
                                toast('Expense deleted')
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chart placeholder</p>
                <p className="text-xs mt-1">Add expenses to see breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                {byCategory.map(([cat, amount]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-accent overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(amount / maxCat) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                ))}
                {/* Placeholder pie-like visual */}
                <div className="mt-6 flex justify-center">
                  <div className="relative h-28 w-28">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      {byCategory.reduce<{ offset: number; els: ReactNode[] }>(
                        (acc, [cat, amount], i) => {
                          const pct = trip.budget > 0
                            ? (amount / trip.budget) * 100
                            : (amount / totalSpent) * 100
                          const colors = ['#B91C1C', '#DC2626', '#F87171', '#FCA5A5', '#FEE2E2', '#991B1B']
                          const el = (
                            <circle
                              key={cat}
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              stroke={colors[i % colors.length]}
                              strokeWidth="4"
                              strokeDasharray={`${pct} ${100 - pct}`}
                              strokeDashoffset={-acc.offset}
                            />
                          )
                          return {
                            offset: acc.offset + pct,
                            els: [...acc.els, el],
                          }
                        },
                        { offset: 0, els: [] }
                      ).els}
                      <circle cx="18" cy="18" r="10" className="fill-card" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editable && <FloatingActionButton onClick={() => setOpen(true)} label="Add Expense" className="sm:hidden" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Log a new trip expense</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Item</Label>
              <Input
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder="e.g. Dinner at restaurant"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
