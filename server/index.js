import 'dotenv/config'
import dns from 'node:dns'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

dns.setServers(['8.8.8.8', '1.1.1.1'])
dns.setDefaultResultOrder('ipv4first')

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI')
  if (!process.env.VERCEL) process.exit(1)
}

const emptyState = {
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
}

const tripDataSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    trip: {
      name: { type: String, default: '' },
      destination: { type: String, default: '' },
      travelDate: { type: String, default: '' },
      returnDate: { type: String, default: '' },
      budget: { type: Number, default: 0 },
    },
    schedule: { type: Array, default: [] },
    activities: { type: Array, default: [] },
    expenses: { type: Array, default: [] },
    tasks: { type: Array, default: [] },
    gallery: { type: Array, default: [] },
  },
  { timestamps: true }
)

const TripData = mongoose.models.TripData || mongoose.model('TripData', tripDataSchema)

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

async function connectDB() {
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI')
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI, { family: 4 })
}

app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    next(err)
  }
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.get('/api/state', async (_req, res) => {
  try {
    let doc = await TripData.findOne({ key: 'default' }).lean()
    if (!doc) {
      doc = (await TripData.create({ key: 'default', ...emptyState })).toObject()
    }
    res.json({
      trip: doc.trip || emptyState.trip,
      schedule: doc.schedule || [],
      activities: doc.activities || [],
      expenses: doc.expenses || [],
      tasks: doc.tasks || [],
      gallery: doc.gallery || [],
      updatedAt: doc.updatedAt,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load data' })
  }
})

app.put('/api/state', async (req, res) => {
  try {
    const { trip, schedule, activities, expenses, tasks, gallery } = req.body || {}
    const doc = await TripData.findOneAndUpdate(
      { key: 'default' },
      {
        key: 'default',
        trip: trip ?? emptyState.trip,
        schedule: schedule ?? [],
        activities: activities ?? [],
        expenses: expenses ?? [],
        tasks: tasks ?? [],
        gallery: gallery ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    res.json({
      trip: doc.trip,
      schedule: doc.schedule,
      activities: doc.activities,
      expenses: doc.expenses,
      tasks: doc.tasks,
      gallery: doc.gallery,
      updatedAt: doc.updatedAt,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || 'Server error' })
})

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('MongoDB connected')
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`3bro API running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message)
      process.exit(1)
    })
}

export default app
