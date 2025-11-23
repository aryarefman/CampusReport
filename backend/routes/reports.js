import express from "express"
import { protect, adminOnly } from "../middleware/auth.js"
import Report from "../models/Report.js"

const router = express.Router()

// Get all reports (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find().populate("userId", "username email").sort({ createdAt: -1 })
    res.json(reports)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get reports by user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ createdAt: -1 })
    res.json(reports)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single report
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("userId", "username email")
    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }
    res.json(report)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create report (with AI analysis data)
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, photoBase64, location, aiAnalysis } = req.body

    if (!title || !photoBase64 || !location) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const report = await Report.create({
      userId: req.user.id,
      title,
      description,
      photoBase64,
      photoUrl: `data:image/jpeg;base64,${photoBase64.substring(0, 50)}...`,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        address: location.address || "",
      },
      aiAnalysis: aiAnalysis || {},
    })

    res.status(201).json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update report status (admin only)
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body

    if (!["pending", "in_progress", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const report = await Report.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true })

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
