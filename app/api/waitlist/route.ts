import { NextRequest, NextResponse } from "next/server";
import { getWaitlistEntries } from "@/lib/firebase/waitlistService";
import { verifyAdminRequest } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getWaitlistEntries();
    return NextResponse.json({ success: !result.error, data: result.data, error: result.error });
  } catch (error) {
    console.error("Admin waitlist GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve waitlist entries." }, { status: 500 });
  }
}
