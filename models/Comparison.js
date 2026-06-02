import mongoose from "mongoose";

const ComparisonSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    img1Url: { type: String, required: true },
    img2Url: { type: String, required: true },
    similarityScore: { type: Number, default: 0 },
    verdict: { type: String, default: "Unknown" },
    justification: { type: String, default: "" },
    metrics: {
      strokePathConsistency: { type: String, default: "N/A" },
      slantAngleMatching: { type: String, default: "N/A" },
      letterSpacingProportions: { type: String, default: "N/A" },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Comparison ||
  mongoose.model("Comparison", ComparisonSchema);
