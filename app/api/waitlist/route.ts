import { NextResponse } from "next/server";
import { getWaitlistEntries } from "@/lib/firebase/waitlistService";

export async function GET() {
  try {
    const result = await getWaitlistEntries();
    return NextResponse.json({ success: !result.error, data: result.data, error: result.error });
  } catch (error) {
    console.error("Admin waitlist GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve waitlist entries." }, { status: 500 });
  }
}
