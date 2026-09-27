import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";

export interface WaitlistRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  company: string;
  lookingFor: string;
  createdAt: string;
  status: string;
}

export async function getWaitlistEntries(): Promise<{ data: WaitlistRecord[]; error?: string }> {
  if (!isFirebaseConfigured()) return { data: [] };

  try {
    const q = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const entries: WaitlistRecord[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      let createdAt = new Date().toISOString();
      if (d.createdAt?.toDate) createdAt = d.createdAt.toDate().toISOString();
      else if (typeof d.createdAt === "string") createdAt = d.createdAt;

      return {
        id: doc.id,
        fullName: d.fullName || "N/A",
        email: d.email || "N/A",
        role: d.role || "Not specified",
        company: d.company || "-",
        lookingFor: d.lookingFor || "-",
        createdAt,
        status: d.status || "pending",
      };
    });

    return { data: entries };
  } catch (error: unknown) {
    const msg = (error as { message?: string })?.message || String(error);
    return { data: [], error: msg };
  }
}
