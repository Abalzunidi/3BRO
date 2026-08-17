export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'
export type TaskStatus = 'pending' | 'completed'

export interface TripInfo {
  name: string
  destination: string
  travelDate: string
  returnDate: string
  budget: number
}

export interface ScheduleActivity {
  id: string
  name: string
  time: string
  location: string
  duration: string
  cost: number
  notes: string
  status: ActivityStatus
  order: number
}

export interface Activity {
  id: string
  name: string
  description: string
  time: string
  cost: number
  location: string
  mapsLink: string
  image: string
  status: ActivityStatus
}

export interface Expense {
  id: string
  item: string
  category: string
  amount: number
  date: string
}

export interface Task {
  id: string
  name: string
  dueDate: string
  status: TaskStatus
}

export interface GalleryImage {
  id: string
  name: string
  url: string
  createdAt: string
  caption?: string
  likedBy?: string[]
}

export type MemberRole = 'admin' | 'member'
export type AppSection = 'dashboard' | 'schedule' | 'activities' | 'budget' | 'payments' | 'tasks' | 'gallery'

export interface Member {
  id: string
  name: string
  pin: string
  username?: string
  role: MemberRole
  sections: AppSection[]
  /** When false, the member can view Gallery but cannot add or delete photos. Default true. */
  galleryUpload?: boolean
}

export interface Payment {
  id: string
  name: string
  amount: number
}

export interface TripState {
  trip: TripInfo
  schedule: ScheduleActivity[]
  activities: Activity[]
  expenses: Expense[]
  tasks: Task[]
  gallery: GalleryImage[]
  members: Member[]
  payments: Payment[]
}
