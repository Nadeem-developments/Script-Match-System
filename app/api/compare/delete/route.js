import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comparison from "@/models/Comparison";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req) {
  const { userId } = await auth();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  await Comparison.deleteOne({ _id: id, userId });
  return NextResponse.json({ success: true });
}
