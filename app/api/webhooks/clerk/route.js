import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new NextResponse("Please add WEBHOOK_SECRET from Clerk Dashboard", {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return new NextResponse("Error: Invalid JSON body", { status: 400 });
  }

  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return new NextResponse("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  try {
    await dbConnect();
  } catch (dbErr) {
    return new NextResponse("Database connection error", { status: 500 });
  }

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

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
      return new NextResponse("Error creating user in DB", { status: 500 });
    }
  }

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
        { new: true },
      );

      return NextResponse.json({
        message: "User updated in MongoDB",
        user: updatedUser,
      });
    } catch (error) {
      return new NextResponse("Error updating user in DB", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await User.findOneAndDelete({ clerkId: id });
      return NextResponse.json({ message: "User deleted from MongoDB" });
    } catch (error) {
      return new NextResponse("Error deleting user from DB", { status: 500 });
    }
  }

  return NextResponse.json(
    { message: "Webhook processed successfully" },
    { status: 200 },
  );
}
