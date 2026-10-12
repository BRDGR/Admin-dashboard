import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  UsersResponse,
  StaffResponse,
  StaffMember,
  CreateStaffPayload,
  SeedHistoryResponse,
} from "@/lib/types";

// ─── Users ────────────────────────────────────────────────────────────────────

export function listUsers(
  page = 1,
  limit = 20,
  search?: string
): Promise<ApiResponse<ApiEnvelope<UsersResponse>>> {
  const q = search?.trim();
  const searchParam = q ? `&search=${encodeURIComponent(q)}` : "";
  return apiRequest(`/admins/users?page=${page}&limit=${limit}${searchParam}`);
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function listStaff(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<StaffResponse>>> {
  const res = await apiRequest<ApiEnvelope<StaffResponse>>(
    `/admins/staff?page=${page}&limit=${limit}`
  );

  // API returns staffs: [{ staff: { id, role, ... }, user: { firstName, ... } }]
  // Flatten into StaffMember array on the staff key
  if (res.data?.data) {
    const raw = res.data.data as unknown as {
      staffs?: { staff: { id: string; role: string; createdAt: string; updatedAt: string }; user: StaffMember }[];
      pagination: StaffResponse["pagination"];
    };
    if (raw.staffs) {
      res.data.data.staff = raw.staffs.map(({ staff, user }) => ({
        ...user,
        staffRole: staff.role,
        updatedAt: staff.updatedAt,
      }));
    }
  }

  return res;
}

export function getStaffMember(
  staffId: string
): Promise<ApiResponse<ApiEnvelope<{ staff: StaffMember }>>> {
  return apiRequest(`/admins/staff/${staffId}`);
}

export function createStaff(
  payload: CreateStaffPayload
): Promise<ApiResponse<ApiEnvelope<{ staff: StaffMember }>>> {
  return apiRequest("/admins/staff", { method: "POST", body: payload });
}

export function getAdminProfile(): Promise<ApiResponse<ApiEnvelope<{ user: StaffMember }>>> {
  return apiRequest("/admins/profile");
}

export function getSeedHistory(): Promise<ApiResponse<ApiEnvelope<SeedHistoryResponse>>> {
  return apiRequest("/admins/seed-history");
}

// ─── Admin Image Management ───────────────────────────────────────────────────

export function uploadAdminImage(
  file: File
): Promise<ApiResponse<ApiEnvelope<{ user?: StaffMember; imageUrl?: string }>>> {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest("/admins/upload-image", {
    method: "PATCH",
    body: formData,
  });
}

export function removeAdminImage(): Promise<
  ApiResponse<ApiEnvelope<{ user?: StaffMember }>>
> {
  return apiRequest("/admins/remove-image", {
    method: "PATCH",
  });
}
