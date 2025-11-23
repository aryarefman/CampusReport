import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { protect } from "../middleware/auth.js"

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Detect damage from image
router.post("/detect-damage", protect, async (req, res) => {
  try {
    const { photoBase64 } = req.body

    if (!photoBase64) {
      return res.status(400).json({ message: "Photo is required" })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a campus facility damage detection AI. 
Analyze the image and return ONLY a valid JSON object (no markdown, no code blocks) with exactly these fields:
{
  "detected_object": "what object/facility is damaged",
  "damage_type": "type of damage (e.g., crack, dent, broken, leak)",
  "severity": "one of: low, medium, high, critical",
  "repair_recommendation": "what repair is needed",
  "confidence_level": number between 0 and 1
}`

    const result = await model.generateContent([
      {
        inlineData: {
          data: photoBase64,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ])

    let analysisText = result.response.text().trim()

    // Remove markdown code blocks if present
    if (analysisText.startsWith("```json")) {
      analysisText = analysisText.slice(7)
    }
    if (analysisText.startsWith("```")) {
      analysisText = analysisText.slice(3)
    }
    if (analysisText.endsWith("```")) {
      analysisText = analysisText.slice(0, -3)
    }
    analysisText = analysisText.trim()

    const analysis = JSON.parse(analysisText)

    res.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("AI Detection Error:", error)
    res.status(500).json({ message: "Failed to analyze image", error: error.message })
  }
})

export default router
