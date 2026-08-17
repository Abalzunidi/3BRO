import { useState } from 'react'
import { Shield, Trash2, UserPlus } from 'lucide-react'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { EmptyState } from '@/components/shared/EmptyState'
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
import { ALL_SECTION_IDS, APP_SECTIONS, normalizeUsername, randomUnusedPin } from '@/lib/sections'
import type { AppSection, Member, MemberRole } from '@/types'
import { motion } from 'framer-motion'

const emptyForm = {
  name: '',
  username: '',
  role: 'member' as MemberRole,
  sections: [...ALL_SECTION_IDS] as AppSection[],
  galleryUpload: true,
}

export function Admin() {
  const { members, addMember, updateMember, deleteMember } = useTrip()
  const { member: me } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setOpen(true)
  }

  const openEdit = (member: Member) => {
    setEditing(member)
    setForm({
      name: member.name,
      username: member.username || '',
      role: member.role,
      sections: [...member.sections],
      galleryUpload: member.galleryUpload !== false,
    })
    setOpen(true)
  }

  const toggleSection = (id: AppSection) => {
    setForm((f) => {
      const on = !f.sections.includes(id)
      const sections = on ? [...f.sections, id] : f.sections.filter((s) => s !== id)
      return {
        ...f,
        sections,
        galleryUpload: id === 'gallery' ? on : f.galleryUpload,
      }
    })
  }

  const handleSave = () => {
    const username = normalizeUsername(form.username || form.name)
    if (!form.name.trim()) {
      toast('Name is required', 'error')
      return
    }
    if (username.length < 2) {
      toast('Username is required', 'error')
      return
    }
    const taken = members.some((m) => {
      if (m.id === editing?.id) return false
      return (
        normalizeUsername(m.username || '') === username ||
        (!m.username && normalizeUsername(m.name) === username)
      )
    })
    if (taken) {
      toast('This username is already used', 'error')
      return
    }
    const payload = {
      name: form.name.trim(),
      username,
      pin: editing?.pin || randomUnusedPin(members.map((m) => m.pin)),
      role: form.role,
      sections: form.role === 'admin' ? [...ALL_SECTION_IDS] : form.sections,
      galleryUpload: form.role === 'admin' ? true : form.sections.includes('gallery') && form.galleryUpload,
    }
    if (editing) {
      updateMember(editing.id, payload)
      toast('Member updated')
    } else {
      addMember(payload)
      toast('Member added — give them their username')
    }
    setOpen(false)
  }

  const handleDelete = (member: Member) => {
    const admins = members.filter((m) => m.role === 'admin')
    if (member.role === 'admin' && admins.length <= 1) {
      toast('Keep at least one admin', 'error')
      return
    }
    if (member.id === me?.id) {
      toast('You cannot delete yourself', 'error')
      return
    }
    deleteMember(member.id)
    toast('Member removed')
  }

  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1">Give each person a username and choose which pages they can see</p>
      </motion.div>

      {members.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No members yet"
          description="Add people and send each one their username."
          action={<Button onClick={openAdd}>+ Add member</Button>}
        />
      ) : (
        <div className="space-y-3">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{member.name}</p>
                  <span className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-accent text-accent-foreground">
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Username: <span className="font-medium text-foreground" dir="auto">{member.username || member.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {member.role === 'admin'
                    ? 'All sections'
                    : member.sections.map((id) => {
                        const label = APP_SECTIONS.find((s) => s.id === id)?.label
                        if (!label) return null
                        if (id === 'gallery' && member.galleryUpload === false) return 'Gallery (view only)'
                        return label
                      }).filter(Boolean).join(' · ') || 'No sections'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => openEdit(member)}>
                  Edit
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(member)} aria-label="Delete member">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <FloatingActionButton onClick={openAdd} label="Add member" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit member' : 'Add member'}</DialogTitle>
            <DialogDescription>They log in with this username. Uncheck pages they should not see.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({
                    ...f,
                    name,
                    username: !f.username || f.username === normalizeUsername(f.name) ? normalizeUsername(name) : f.username,
                  }))
                }}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="username"
                dir="auto"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.role === 'member' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, role: 'member' })}
                >
                  Member
                </Button>
                <Button
                  type="button"
                  variant={form.role === 'admin' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, role: 'admin', sections: [...ALL_SECTION_IDS] })}
                >
                  Admin
                </Button>
              </div>
            </div>
            {form.role === 'member' && (
              <div className="space-y-2">
                <Label>Sections they can see</Label>
                <div className="grid grid-cols-1 gap-2">
                  {APP_SECTIONS.map((section) => (
                    <div key={section.id} className="rounded-2xl border border-border">
                      <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/40">
                        <input
                          type="checkbox"
                          checked={form.sections.includes(section.id)}
                          onChange={() => toggleSection(section.id)}
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm">{section.label}</span>
                      </label>
                      {section.id === 'gallery' && form.sections.includes('gallery') && (
                        <label className="flex items-center gap-3 px-3 pb-2.5 pl-10 cursor-pointer hover:bg-accent/40">
                          <input
                            type="checkbox"
                            checked={form.galleryUpload}
                            onChange={() => setForm((f) => ({ ...f, galleryUpload: !f.galleryUpload }))}
                            className="h-4 w-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm">Add photos</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <UserPlus className="h-4 w-4" />
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
