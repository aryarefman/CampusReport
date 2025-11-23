import mongoose from "mongoose"

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  photoBase64: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: String,
  },
  aiAnalysis: {
    detected_object: String,
    damage_type: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
    },
    repair_recommendation: String,
    confidence_level: Number,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create geospatial index for map queries
reportSchema.index({ location: "2dsphere" })

export default mongoose.model("Report", reportSchema)
