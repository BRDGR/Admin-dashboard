import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  DirectoryContact,
  DirectoryContactsResponse,
  CreateContactPayload,
} from "@/lib/types";

// ─── Directory Contacts CRM ──────────────────────────────────────────────────

// API returns contacts as [{ contact: {...}, addedBy: {...} }]
// Flatten into DirectoryContact with addedBy attached
function unwrapContacts(
  raw: { contact: DirectoryContact; addedBy: DirectoryContact["addedBy"] }[]
): DirectoryContact[] {
  return raw.map(({ contact, addedBy }) => ({ ...contact, addedBy }));
}

export async function listDirectoryContacts(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ApiEnvelope<DirectoryContactsResponse>>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const res = await apiRequest<ApiEnvelope<DirectoryContactsResponse>>(
    `/admin/directory-contacts${qs ? `?${qs}` : ""}`
  );

  if (res.data?.data?.contacts) {
    res.data.data.contacts = unwrapContacts(
      res.data.data.contacts as unknown as { contact: DirectoryContact; addedBy: DirectoryContact["addedBy"] }[]
    );
  }

  return res;
}

export function getDirectoryContact(
  contactId: string
): Promise<ApiResponse<ApiEnvelope<{ contact: DirectoryContact }>>> {
  return apiRequest(`/admin/directory-contacts/${contactId}`);
}

export function createDirectoryContact(
  payload: CreateContactPayload
): Promise<ApiResponse<ApiEnvelope<{ contact: DirectoryContact }>>> {
  return apiRequest(`/admin/directory-contacts`, {
    method: "POST",
    body: payload,
  });
}

export function updateDirectoryContact(
  contactId: string,
  payload: Partial<CreateContactPayload>
): Promise<ApiResponse<ApiEnvelope<{ contact: DirectoryContact }>>> {
  return apiRequest(`/admin/directory-contacts/${contactId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteDirectoryContact(
  contactId: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  return apiRequest(`/admin/directory-contacts/${contactId}`, {
    method: "DELETE",
  });
}
