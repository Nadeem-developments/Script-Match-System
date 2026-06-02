import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comparison from "@/models/Comparison";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(_request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = params;

    // Sirf wahi record delete ho jo is user ka ho
    const deletedDocument = await Comparison.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedDocument) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
