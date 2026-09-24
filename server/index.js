import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = Number(process.env.PORT) || 5000

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rollNumber: { type: String, required: true },
  dob: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  arrears: { type: String, required: true },
  companies: { type: [String], default: [] },
  registeredAt: { type: Date, default: Date.now },
})

const Student = mongoose.model('Student', studentSchema)

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database unavailable' })
})

app.get('/api/registrations', async (_request, response) => {
  try {
    const students = await Student.find().sort({ registeredAt: -1 }).lean()
    response.json(students)
  } catch (error) {
    console.error('Failed to load registrations:', error.message)
    response.status(500).json({ message: 'Failed to load registrations' })
  }
})

app.post('/api/registrations', async (request, response) => {
  try {
    const student = await Student.create(request.body)
    response.status(201).json(student)
  } catch (error) {
    console.error('Failed to save registration:', error.message)
    response.status(400).json({ message: 'Failed to save registration', error: error.message })
  }
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
      console.log('MongoDB connected')
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exitCode = 1
  })