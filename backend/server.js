import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import multer from "multer"
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err))

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
})

const RecordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  filename: String,
  fileHash: String,
  size: Number,
  mimeType: String,
  encryptedData: String, // Kept for consistency, but we store file on disk
  timestamp: Date,
  diseaseTags: [String], // AI-extracted disease patterns
  aiAnalyzed: { type: Boolean, default: false }, // Analysis completion flag
  aiAnalysisDate: Date // When analysis was performed
})

const ConsentSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  grantedAt: Date
})

const BlockSchema = new mongoose.Schema({
  id: Number,
  previousHash: String,
  dataHash: String,
  timestamp: Date,
  recordCount: Number,
  verified: Boolean
})

const User = mongoose.model("User", UserSchema)
const Record = mongoose.model("Record", RecordSchema)
const Consent = mongoose.model("Consent", ConsentSchema)
const Block = mongoose.model("Block", BlockSchema)

const ResearchDataSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  title: String,
  category: String,
  summary: String,
  riskFactors: [String],
  recommendations: [String],
  timestamp: Date,
  verified: Boolean
})

const ResearchData = mongoose.model("ResearchData", ResearchDataSchema)

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    console.log(`❌ Auth failed: No token provided for ${req.method} ${req.path}`)
    return res.sendStatus(401)
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    console.log(`✓ Auth success: User ${req.user.name} (${req.user.role}) accessing ${req.method} ${req.path}`)
    next()
  } catch (err) {
    console.log(`❌ Auth failed: Invalid token for ${req.method} ${req.path}`)
    res.sendStatus(403)
  }
}

// Disk Storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage })

const createBlock = async (data) => {
  const lastBlock = await Block.findOne().sort({ timestamp: -1 })
  const previousHash = lastBlock ? lastBlock.dataHash : "0".repeat(64) // Genesis hash
  const dataHash = crypto.createHash("sha256").update(data).digest("hex")

  // Calculate verified ID
  const newId = lastBlock ? lastBlock.id + 1 : 1

  await Block.create({
    id: newId,
    previousHash,
    dataHash,
    timestamp: new Date(),
    recordCount: 1, // Simplified: 1 block per record for this demo
    verified: true
  })
  return dataHash
}

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (await User.findOne({ email })) return res.status(400).json({ error: "Email already exists" })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role })
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.sendStatus(404)
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.sendStatus(401)
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/records/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })

    console.log(`📤 Upload: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes) by ${req.user.name}`)

    // In a real blockchain, we'd batch these, but here we create a block per upload for immediate feedback
    const fileHash = await createBlock(fs.readFileSync(req.file.path).toString())

    const record = await Record.create({
      owner: req.user.id,
      name: req.file.originalname,
      filename: req.file.filename,
      fileHash,
      size: req.file.size,
      mimeType: req.file.mimetype,
      encryptedData: "simulated_encrypted_content",
      timestamp: new Date(),
      aiAnalyzed: false
    })

    console.log(`✓ Record created: ${record._id}`)
    console.log(`🤖 Triggering AI analysis for record ${record._id}...`)

    // Trigger AI analysis asynchronously (don't block response)
    analyzeRecordForDisease(record._id, req.file.path, req.file.mimetype)
      .catch(err => console.error('❌ AI Analysis Error:', err))

    res.json(record)
  } catch (err) {
    console.error(`❌ Upload error:`, err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/records/my-records", auth, async (req, res) => {
  try {
    const records = await Record.find({ owner: req.user.id }).sort({ timestamp: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/records/shared-with-me", auth, async (req, res) => {
  try {
    const consents = await Consent.find({ sharedWith: req.user.id }).populate('recordId')
    // Filter out nulls in case record was deleted
    const records = consents.map(c => c.recordId).filter(r => r != null)
    // Add a flag to indicate it's shared
    const recordsWithFlag = records.map(r => ({ ...r.toObject(), status: 'shared' }))
    res.json(recordsWithFlag)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/records/all-records", auth, async (req, res) => {
  try {
    // Only researchers can access all records
    if (req.user.role !== 'researcher') {
      console.log(`❌ Access denied: ${req.user.name} (${req.user.role}) tried to access all records`)
      return res.status(403).json({ error: 'Access denied. Researchers only.' })
    }

    console.log(`✓ Researcher access: ${req.user.name} fetching all records`)

    const records = await Record.find()
      .populate('owner', 'name email') // Include patient info for research
      .sort({ timestamp: -1 })

    console.log(`✓ Returning ${records.length} records to researcher`)
    res.json(records)
  } catch (err) {
    console.error(`❌ Error fetching all records:`, err)
    res.status(500).json({ error: err.message })
  }
})

app.post("/records/analyze-batch", auth, async (req, res) => {
  try {
    // Find records that haven't been analyzed
    const unanalyzedRecords = await Record.find({
      $or: [
        { aiAnalyzed: false },
        { aiAnalyzed: { $exists: false } }
      ]
    }).limit(10) // Process 10 at a time to avoid overload

    if (unanalyzedRecords.length === 0) {
      return res.json({ message: 'All records are already analyzed', count: 0 })
    }

    // Trigger analysis for each record
    const promises = unanalyzedRecords.map(record => {
      const filePath = path.join(__dirname, 'uploads', record.filename)
      return analyzeRecordForDisease(record._id, filePath, record.mimeType)
    })

    await Promise.all(promises)

    res.json({
      message: `Started analysis for ${unanalyzedRecords.length} records`,
      count: unanalyzedRecords.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/research/by-record/:recordId", auth, async (req, res) => {
  try {
    console.log(`🔍 Fetching research data for record: ${req.params.recordId}`)

    // Convert string to ObjectId for proper MongoDB query
    const recordObjectId = new mongoose.Types.ObjectId(req.params.recordId)
    const researchData = await ResearchData.findOne({ recordId: recordObjectId })

    if (!researchData) {
      console.log(`❌ No research data found for record: ${req.params.recordId}`)
      return res.status(404).json({ error: 'No analysis found for this record' })
    }
    console.log(`✓ Found research data:`, {
      id: researchData._id,
      summary: researchData.summary?.substring(0, 50),
      riskFactors: researchData.riskFactors?.length,
      recommendations: researchData.recommendations?.length
    })
    res.json(researchData)
  } catch (err) {
    console.error(`❌ Error fetching research data:`, err)
    res.status(500).json({ error: err.message })
  }
})


app.post("/records/share", auth, async (req, res) => {
  try {
    const { recordId, email, role } = req.body
    const targetUser = await User.findOne({ email })
    if (!targetUser) return res.status(404).json({ error: "User not found" })

    // Check ownership
    const record = await Record.findOne({ _id: recordId, owner: req.user.id })
    if (!record) return res.status(403).json({ error: "Record not found or access denied" })

    const consent = await Consent.create({
      recordId,
      sharedWith: targetUser._id,
      grantedAt: new Date()
    })

    res.json(consent)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/records/access/:id", auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
    if (!record) return res.sendStatus(404)

    // Check permissions
    const isOwner = record.owner.toString() === req.user.id
    if (!isOwner) {
      const consent = await Consent.findOne({
        recordId: record._id,
        sharedWith: req.user.id
      })
      if (!consent && req.user.role !== 'researcher') return res.sendStatus(403)
      // Researchers might have special access logic, keeping simple for now
    }

    const filePath = path.join(__dirname, 'uploads', record.filename)
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', record.mimeType || 'application/octet-stream')
      res.setHeader('Content-Disposition', `inline; filename="${record.name}"`)
      res.sendFile(filePath)
    } else {
      res.status(404).json({ error: "File not found on server" })
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const totalRecords = await Record.countDocuments({ owner: req.user.id })
    const sharedRecords = await Consent.countDocuments({ sharedWith: req.user.id }) // For doctors
    const mySharedCount = await Consent.countDocuments({ recordId: { $in: await Record.find({ owner: req.user.id }).distinct('_id') } }) // For patients

    // Simplified verified count (all uploaded are 'verified' in this demo)
    const verifiedCount = totalRecords

    res.json({
      totalRecords,
      sharedCount: req.user.role === 'patient' ? mySharedCount : sharedRecords,
      verifiedCount
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/dashboard/activity", auth, async (req, res) => {
  try {
    const activities = []

    // Get recent uploads
    const recentRecords = await Record.find({ owner: req.user.id })
      .sort({ timestamp: -1 })
      .limit(3)

    for (const record of recentRecords) {
      activities.push({
        title: `Uploaded ${record.name}`,
        time: getRelativeTime(record.timestamp),
        type: 'upload'
      })
    }

    // Get recent shares
    const recentShares = await Consent.find({
      recordId: { $in: await Record.find({ owner: req.user.id }).distinct('_id') }
    })
      .populate('sharedWith')
      .populate('recordId')
      .sort({ grantedAt: -1 })
      .limit(2)

    for (const share of recentShares) {
      if (share.sharedWith && share.recordId) {
        activities.push({
          title: `Shared with ${share.sharedWith.name}`,
          time: getRelativeTime(share.grantedAt),
          type: 'shared'
        })
      }
    }

    // Get recent blockchain verifications
    const recentBlocks = await Block.find()
      .sort({ timestamp: -1 })
      .limit(2)

    for (const block of recentBlocks) {
      activities.push({
        title: 'Record verified on blockchain',
        time: getRelativeTime(block.timestamp),
        type: 'verified'
      })
    }

    // Sort by most recent and limit to 5
    activities.sort((a, b) => {
      const timeA = parseRelativeTime(a.time)
      const timeB = parseRelativeTime(b.time)
      return timeA - timeB
    })

    res.json(activities.slice(0, 5))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/dashboard/doctor-stats", auth, async (req, res) => {
  try {
    // Get records shared with this doctor
    const consents = await Consent.find({ sharedWith: req.user.id })
    const accessibleRecords = consents.length

    // Get unique patients who have shared records
    const recordIds = consents.map(c => c.recordId)
    const records = await Record.find({ _id: { $in: recordIds } })
    const uniquePatients = new Set(records.map(r => r.owner.toString()))
    const patients = uniquePatients.size

    // Active consents are all consents (simplified)
    const activeConsents = accessibleRecords

    res.json({
      accessibleRecords,
      activeConsents,
      patients
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/dashboard/researcher-stats", auth, async (req, res) => {
  try {
    // Get research datasets
    const datasets = await ResearchData.countDocuments()

    // Get verified records available for research
    const verifiedRecords = await Record.countDocuments()

    // Anchors are blockchain blocks
    const anchors = await Block.countDocuments()

    res.json({
      datasets,
      verifiedRecords,
      anchors
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/dashboard/admin-stats", adminAuth, async (req, res) => {
  try {
    const patients = await User.countDocuments({ role: 'patient' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const researchers = await User.countDocuments({ role: 'researcher' });

    res.json({
      patients,
      doctors,
      researchers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Helper function to parse relative time for sorting
function parseRelativeTime(timeStr) {
  if (timeStr === 'Just now') return 0
  const match = timeStr.match(/(\d+)\s+(second|minute|hour|day)/)
  if (!match) return 0
  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers = { second: 1, minute: 60, hour: 3600, day: 86400 }
  return value * (multipliers[unit] || 0)
}


app.get("/blockchain/ledger", async (req, res) => {
  try {
    const blocks = await Block.find().sort({ timestamp: -1 })
    res.json(blocks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Disease Pattern Discovery (OpenRouter) ---
import OpenAI from "openai"
const pdfParse = require("pdf-parse")

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Helper function to analyze a record for disease patterns
async function analyzeRecordForDisease(recordId, filePath, mimeType) {
  try {
    let text = ""

    // Extract text from file
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      text = data.text
    } else {
      text = fs.readFileSync(filePath, "utf8")
    }

    if (!text || text.trim().length < 10) {
      console.log(`⚠️  Skipping analysis for ${recordId}: insufficient text (${text.trim().length} chars)`)
      return
    }

    console.log(`📄 Extracted ${text.length} characters from document`)
    console.log(`🔍 Sending to AI for analysis...`)

    // Call AI for disease pattern analysis
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001", // Correct model name
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant. Analyze the provided medical document and extract comprehensive medical information.

Return ONLY a valid JSON object with this exact structure:
{
  "disease_patterns": ["Disease Name 1", "Disease Name 2"],
  "summary": "Brief summary of the medical condition",
  "causes": ["Cause 1", "Cause 2"],
  "suggested_treatments": ["Treatment 1", "Treatment 2"]
}

Rules:
- disease_patterns: Array of specific disease/condition names found (e.g., "Diabetes Type 2", "Hypertension")
- summary: 1-2 sentence summary of the patient's condition
- causes: Array of identified or potential causes
- suggested_treatments: Array of recommended treatments or interventions
- If any field has no data, use an empty array [] or empty string ""
- Keep all entries concise and medical`
        },
        { role: "user", content: `Analyze this medical document:\n\n${text.substring(0, 8000)}` }
      ],
      response_format: { type: "json_object" }
    })

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("Invalid response from AI")
    }

    console.log(`✓ AI response received`)

    const analysis = JSON.parse(completion.choices[0].message.content)
    const diseaseTags = analysis.disease_patterns || []

    console.log(`📊 Analysis results:`)
    console.log(`   - Diseases: ${diseaseTags.join(', ') || 'None'}`)
    console.log(`   - Summary: ${analysis.summary?.substring(0, 100) || 'None'}...`)
    console.log(`   - Causes: ${analysis.causes?.length || 0} identified`)
    console.log(`   - Treatments: ${analysis.suggested_treatments?.length || 0} suggested`)

    // Update record with disease tags
    await Record.findByIdAndUpdate(recordId, {
      diseaseTags: diseaseTags,
      aiAnalyzed: true,
      aiAnalysisDate: new Date()
    })

    // Also save to ResearchData for detailed analysis
    const researchDataDoc = await ResearchData.create({
      recordId: recordId,
      title: `Analysis for record ${recordId}`,
      category: diseaseTags[0] || 'General',
      summary: analysis.summary || 'No summary available',
      riskFactors: analysis.causes || [],
      recommendations: analysis.suggested_treatments || [],
      timestamp: new Date(),
      verified: true
    })

    console.log(`✅ ResearchData saved with ID: ${researchDataDoc._id}`)
    console.log(`   - recordId: ${recordId}`)
    console.log(`   - summary: ${analysis.summary?.substring(0, 50)}...`)
    console.log(`   - riskFactors: ${analysis.causes?.length || 0}`)
    console.log(`   - recommendations: ${analysis.suggested_treatments?.length || 0}`)

    console.log(`✅ Analysis complete for record ${recordId}: Found ${diseaseTags.length} disease patterns`)
  } catch (err) {
    console.error(`❌ Failed to analyze record ${recordId}:`, err.message)
    // Mark as analyzed even if failed to avoid retry loops
    await Record.findByIdAndUpdate(recordId, {
      aiAnalyzed: true,
      aiAnalysisDate: new Date(),
      diseaseTags: []
    })
  }
}


app.post("/analyze/disease-pattern", auth, upload.single("file"), async (req, res) => {
  try {
    let text = ""

    // Check if file is uploaded or existing record is used
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(req.file.path)
        const data = await pdfParse(dataBuffer)
        text = data.text
      } else {
        // Assume text file
        text = fs.readFileSync(req.file.path, "utf8")
      }
    } else if (req.body.recordId) {
      const record = await Record.findOne({ _id: req.body.recordId })
      if (!record) return res.status(404).json({ error: "Record not found" })

      // check permission
      if (record.owner.toString() !== req.user.id) return res.status(403).json({ error: "Access denied" })

      const filePath = path.join(__dirname, 'uploads', record.filename)
      if (record.mimeType === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath)
        const data = await pdfParse(dataBuffer)
        text = data.text
      } else {
        text = fs.readFileSync(filePath, "utf8")
      }
    } else {
      return res.status(400).json({ error: "No file or recordId provided" })
    }

    if (!text) return res.status(400).json({ error: "Could not extract text from file" })

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free", // Use a capable model
      messages: [
        { role: "system", content: "You are a medical AI assistant. Analyze the provided medical document text and identify potential disease patterns, risk factors, and key medical insights. Format your response as a structured JSON object with keys: 'disease_patterns', 'risk_factors', 'summary', 'recommendations'." },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    })

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("Invalid response structure from API")
    }

    const analysis = JSON.parse(completion.choices[0].message.content)

    // Save analysis to ResearchData
    // finding the record to link
    let recordIdToLink = req.body.recordId
    let recordTitle = "Untitled Analysis"

    if (req.file) {
      // Create a record for the uploaded file if it doesn't exist yet (simple handled here for demo)
      const fileHash = await createBlock(fs.readFileSync(req.file.path).toString())
      const newRecord = await Record.create({
        owner: req.user.id,
        name: req.file.originalname,
        filename: req.file.filename,
        fileHash,
        size: req.file.size,
        mimeType: req.file.mimetype,
        encryptedData: "simulated_encrypted_content",
        timestamp: new Date()
      })
      recordIdToLink = newRecord._id
      recordTitle = newRecord.name
    } else if (req.body.recordId) {
      const r = await Record.findById(req.body.recordId)
      if (r) recordTitle = r.name
    }

    if (recordIdToLink) {
      await ResearchData.create({
        recordId: recordIdToLink,
        title: recordTitle,
        category: analysis.disease_patterns?.[0] || "General", // Simple extraction
        summary: analysis.summary || "No summary provided",
        riskFactors: analysis.risk_factors || [],
        recommendations: analysis.recommendations || [],
        timestamp: new Date(),
        verified: true // Assumed verified if analyzed
      })
    }

    res.json(analysis)

  } catch (err) {
    console.error("Analysis Error:", err)
    res.status(500).json({ error: "Failed to analyze document: " + err.message })
  }
})

// --- Admin System ---

async function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.sendStatus(401)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') return res.sendStatus(403)
    req.user = decoded
    next()
  } catch {
    res.sendStatus(403)
  }
}

app.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, "-password")
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/users", adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (await User.findOne({ email })) return res.status(400).json({ error: "Email already exists" })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const { name, email, role } = req.body
    const updateData = { name, email, role }
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10)
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password")
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Research Data Endpoints ---

app.get("/research/datasets", auth, async (req, res) => {
  try {
    const datasets = await ResearchData.find().populate('recordId').sort({ timestamp: -1 })
    // Map to frontend expectation
    const formatted = datasets.map(d => ({
      id: d._id,
      title: d.title,
      category: d.category,
      recordCount: 1, // Single record per analysis for now
      dateRange: new Date(d.timestamp).getFullYear().toString(),
      status: 'available',
      verified: d.verified ? 1 : 0,
      summary: d.summary,
      riskFactors: d.riskFactors || [],
      recommendations: d.recommendations || []
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on ${process.env.PORT || 5000}`)
})
