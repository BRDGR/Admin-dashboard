import { NextResponse } from "next/server";
import { getDemoRequests } from "@/lib/firebase/demoService";

export async function GET() {
  try {
    const result = await getDemoRequests();
    return NextResponse.json({ success: !result.error, data: result.data, error: result.error });
  } catch (error) {
    console.error("Admin demo requests GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve demo requests." }, { status: 500 });
  }
}
