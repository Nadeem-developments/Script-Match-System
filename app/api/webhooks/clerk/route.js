import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// ✅ Sahi Relative Paths (4 levels up from /app/api/webhooks/clerk)
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function POST(req) {
  // 1. Secret key check kar rahe hain
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing WEBHOOK_SECRET in environment variables");
    return new NextResponse("Please add WEBHOOK_SECRET from Clerk Dashboard", {
      status: 500,
    });
  }

  // 2. Security Verification ke liye headers le rahe hain
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Agar headers missing hain toh forn error return karein
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", { status: 400 });
  }

  // 3. Request ki body content get kar rahe hain
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return new NextResponse("Error: Invalid JSON body", { status: 400 });
  }

  const body = JSON.stringify(payload);

  // 4. Verify kar rahe hain ke request sach mein Clerk se hi aayi hai
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Error verifying webhook:", err.message);
    return new NextResponse("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  // 5. Database connection call kiya
  try {
    await dbConnect();
  } catch (dbErr) {
    console.error("❌ Database connection failed:", dbErr);
    return new NextResponse("Database connection error", { status: 500 });
  }

  // 🌟 CASE 1: Jab Naya Account Banega (Sign Up)
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // First Name aur Last Name ko mila kar full name bana rahe hain
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";
    const primaryEmail =
      email_addresses && email_addresses.length > 0
        ? email_addresses[0].email_address
        : "";

    try {
      const newUser = await User.create({
        clerkId: id,
        name: fullName,
        email: primaryEmail,
        avatar: image_url || "https://github.com/shadcn.png",
        comparisons: [],
      });

      return NextResponse.json({
        message: "User successfully created in MongoDB",
        user: newUser,
      });
    } catch (error) {
      console.error("❌ MongoDB User Creation Error:", error);
      return new NextResponse("Error creating user in DB", { status: 500 });
    }
  }

  // 🌟 CASE 2: Jab User apni Profile Update karega Clerk par
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";
    const primaryEmail =
      email_addresses && email_addresses.length > 0
        ? email_addresses[0].email_address
        : "";

    try {
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          name: fullName,
          email: primaryEmail,
          avatar: image_url || "https://github.com/shadcn.png",
        },
        { new: true }, // Updated data return karega
      );

      return NextResponse.json({
        message: "User updated in MongoDB",
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ MongoDB User Update Error:", error);
      return new NextResponse("Error updating user in DB", { status: 500 });
    }
  }

  // 🌟 CASE 3: Jab User Account Delete karega
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await User.findOneAndDelete({ clerkId: id });
      return NextResponse.json({ message: "User deleted from MongoDB" });
    } catch (error) {
      console.error("❌ MongoDB User Deletion Error:", error);
      return new NextResponse("Error deleting user from DB", { status: 500 });
    }
  }

  // Default response agar koi match na ho event
  return NextResponse.json(
    { message: "Webhook processed successfully" },
    { status: 200 },
  );
}
