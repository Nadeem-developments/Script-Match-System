import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comparison from "@/models/Comparison";
import { auth } from "@clerk/nextjs/server";

// 🛠️ GET: History se data fetch karne ke liye (Jab Results page par sirf ID ho)
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    await dbConnect();

    // URL se ID nikalna: /api/compare?id=...
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const record = await Comparison.findOne({ _id: id, userId });
      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: true, data: record },
        { status: 200 },
      );
    }

    // Agar ID nahi hai to poori history return karein
    const history = await Comparison.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: history }, { status: 200 });
  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 🔥 POST: Naya analysis process aur save karne ke liye
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { img1Url, img2Url } = body;

    if (!img1Url || !img2Url) {
      return NextResponse.json({ error: "Images required" }, { status: 400 });
    }

    // Mock ML Results (Aapka logic yahan aayega)
    const similarityScore = 85;
    const verdict = "Match Found";
    const justification =
      "Strong geometric similarities in stroke paths and character spacing detected.";
    const metrics = {
      strokePathConsistency: "High Consistency (88%)",
      slantAngleMatching: "Parallel Angle Slant (82%)",
      letterSpacingProportions: "Uniform Spacing (85%)",
    };

    const newComparison = await Comparison.create({
      userId,
      similarityScore,
      verdict,
      img1Url,
      img2Url,
      metrics,
      justification,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        id: newComparison._id.toString(),
        data: newComparison,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
