import { Webhook } from "svix";
import { headers } from "next/headers";

// ✅ Ab yeh bilkul sahi kaam karega
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function POST(req) {
  // 1. Secret key check kar rahe hain
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env.local",
    );
  }

  // Security Verification ke liye headers le rahe hain
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Request ki body content get kar rahe hain
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  // Verify kar rahe hain ke request sach mein Clerk se hi aayi hai
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  // Aapka database connection call kiya
  await dbConnect();

  // 🌟 CASE 1: Jab Naya Account Banega (Sign Up)
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // First Name aur Last Name ko mila kar full name bana rahe hain
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";

    try {
      const newUser = await User.create({
        clerkId: id,
        name: fullName,
        email: email_addresses[0].email_address,
        avatar: image_url || "https://github.com/shadcn.png",
        comparisons: [], // Shuru mein empty array rahega
      });

      return NextResponse.json({
        message: "User successfully created in MongoDB",
        user: newUser,
      });
    } catch (error) {
      console.error("MongoDB User Creation Error:", error);
      return new Response("Error creating user in DB", { status: 500 });
    }
  }

  // 🌟 CASE 2: Jab User apni Profile Update karega Clerk par
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";

    try {
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          name: fullName,
          email: email_addresses[0].email_address,
          avatar: image_url || "https://github.com/shadcn.png",
        },
        { new: true }, // Updated data return karega
      );

      return NextResponse.json({
        message: "User updated in MongoDB",
        user: updatedUser,
      });
    } catch (error) {
      console.error("MongoDB User Update Error:", error);
      return new Response("Error updating user in DB", { status: 500 });
    }
  }

  // 🌟 CASE 3: Jab User Account Delete karega
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await User.findOneAndDelete({ clerkId: id });
      return NextResponse.json({ message: "User deleted from MongoDB" });
    } catch (error) {
      console.error("MongoDB User Deletion Error:", error);
      return new Response("Error deleting user from DB", { status: 500 });
    }
  }

  return new Response("Webhook received successfully", { status: 200 });
}
