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
  limit = 20
): Promise<ApiResponse<ApiEnvelope<UsersResponse>>> {
  return apiRequest(`/admins/users?page=${page}&limit=${limit}`);
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export function listStaff(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<StaffResponse>>> {
  return apiRequest(`/admins/staff?page=${page}&limit=${limit}`);
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
