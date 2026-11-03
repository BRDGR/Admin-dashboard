import { NextRequest, NextResponse } from "next/server";
import { getDemoRequests } from "@/lib/firebase/demoService";
import { verifyAdminRequest } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getDemoRequests();
    return NextResponse.json({ success: !result.error, data: result.data, error: result.error });
  } catch (error) {
    console.error("Admin demo requests GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve demo requests." }, { status: 500 });
  }
}
