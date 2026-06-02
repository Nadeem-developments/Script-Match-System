import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // 🌟 Clerk ki unique ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "https://github.com/shadcn.png" },
    // Dashboard par dikhane ke liye comparisons ki list
    comparisons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comparison" }],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
