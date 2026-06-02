import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comparison from "@/models/Comparison";
import { auth } from "@clerk/nextjs/server";

// Python Render API ka sahi URL (/compare endpoint ke sath)
const PYTHON_API = "https://script-match-python.onrender.com/compare";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    await dbConnect();
    const { img1Url, img2Url } = await req.json();

    if (!img1Url || !img2Url)
      return NextResponse.json(
        { success: false, error: "Missing images" },
        { status: 400 },
      );

    const pythonRes = await fetch(PYTHON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ img1Url, img2Url }),
    });

    if (!pythonRes.ok) {
      const errorText = await pythonRes.text();
      console.error("Python Error:", errorText);
      return NextResponse.json(
        { success: false, error: "Python engine error" },
        { status: 500 },
      );
    }

    const mlData = await pythonRes.json();

    const newRecord = await Comparison.create({
      userId,
      img1Url,
      img2Url,
      similarityScore: mlData.similarityScore ?? 0,
      verdict: mlData.verdict ?? "Unknown",
      metrics: mlData.metrics ?? {},
      justification: mlData.justification ?? "No analysis available",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: newRecord });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
