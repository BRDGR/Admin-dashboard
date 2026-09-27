import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import type { DemoRequest } from "@/lib/types";

export async function getDemoRequests(): Promise<{ data: DemoRequest[]; error?: string }> {
  if (!isFirebaseConfigured()) return { data: [] };

  try {
    const q = query(collection(db, "demo_requests"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const entries: DemoRequest[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      let createdAt = new Date().toISOString();
      if (d.createdAt?.toDate) createdAt = d.createdAt.toDate().toISOString();
      else if (typeof d.createdAt === "string") createdAt = d.createdAt;

      return {
        id: doc.id,
        email: d.email || "N/A",
        phone: d.phone || "N/A",
        companyName: d.companyName || "—",
        companyType: d.companyType || "—",
        message: d.message || "",
        createdAt,
        status: d.status || "pending_schedule",
        userAgent: d.userAgent,
        referrer: d.referrer,
      };
    });

    return { data: entries };
  } catch (error: unknown) {
    const msg = (error as { message?: string })?.message || String(error);
    return { data: [], error: msg };
  }
}
