import { apiRequest, type ApiResponse } from "./client";
import { listOrganizations } from "./organizations.api";
import { listUsers } from "./users.api";
import type {
  ApiEnvelope,
  ClientsResponse,
  AdminClientRecord,
  AdminUser,
  AdminClientOrganization,
} from "@/lib/types";

// Helper to map an organization record to AdminClientOrganization
function mapOrg(rec: any): AdminClientOrganization {
  const o = rec.organization || rec;
  return {
    id: o.id,
    name: o.name,
    companyType: o.companyType,
    country: o.country,
    website: o.website,
    status: o.status,
    isVerified: o.isVerified,
    role: "owner",
    createdAt: o.createdAt,
  };
}

// Helper to find matching organizations by owner ID or email
function findOrgs(orgRecords: any[], userId?: string, email?: string): AdminClientOrganization[] {
  if (!orgRecords.length) return [];
  const cleanEmail = email?.trim().toLowerCase();
  return orgRecords
    .filter((rec: any) => {
      const ownerId = rec.owner?.id;
      const ownerEmail = rec.owner?.email?.trim().toLowerCase();
      return (
        (ownerId && userId && ownerId === userId) ||
        (ownerEmail && cleanEmail && ownerEmail === cleanEmail)
      );
    })
    .map(mapOrg);
}

// ─── Clients Admin ────────────────────────────────────────────────────────────

export async function listClients(
  page = 1,
  limit = 20
): Promise<ApiResponse<ApiEnvelope<ClientsResponse>>> {
  console.log(`[Clients API] listClients — GET /admin/clients?page=${page}&limit=${limit}`);

  const [res, orgsRes] = await Promise.all([
    apiRequest<ApiEnvelope<any>>(`/admin/clients?page=${page}&limit=${limit}`),
    listOrganizations(1, 100).catch(() => ({ data: null })),
  ]);

  const orgRecords: any[] = (orgsRes?.data?.data as any)?.organizations || [];

  if (res.status >= 200 && res.status < 300 && res.data) {
    const rawData = res.data?.data || res.data;
    const rawList: any[] = (
      rawData.clients || rawData.records || rawData.partners || rawData.users ||
      (Array.isArray(rawData) ? rawData : [])
    );

    const normalizedClients: AdminClientRecord[] = rawList.map((item: any, idx: number) => {
      const user: AdminUser = item.user || {
        id: item.id || `user-${idx}`,
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        email: item.email || "",
        role: item.role || "client",
        isActive: item.isActive !== undefined ? item.isActive : true,
        emailVerifiedAt: item.emailVerifiedAt || null,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      };

      const matchedOrgs = findOrgs(orgRecords, user.id, user.email);
      const primaryOrg = item.organization || item.organizations?.[0] || matchedOrgs[0] || null;
      const allOrgs = item.organizations?.length
        ? item.organizations
        : (matchedOrgs.length ? matchedOrgs : (primaryOrg ? [primaryOrg] : []));

      return {
        id: item.user?.id || item.id || `client-${idx}`,
        user,
        organization: primaryOrg,
        organizations: allOrgs,
        partnerProfile: item.partnerProfile || null,
        createdAt: item.user?.createdAt || item.createdAt || new Date().toISOString(),
      };
    });

    const pagination = (res.data as any)?.pagination || rawData?.pagination || {
      currentPage: page,
      nextPage: null,
      prevPage: null,
      hasNext: false,
      hasPrev: false,
      totalPages: 1,
      totalRecords: normalizedClients.length,
    };

    return {
      status: res.status,
      ok: true,
      error: null,
      data: {
        error: false,
        message: "Clients retrieved successfully",
        data: {
          clients: normalizedClients,
          partners: normalizedClients,
          records: normalizedClients,
          pagination,
        },
      } as any,
    };
  }

  // Fallback: If /admin/clients 404s, query /admins/users
  try {
    const usersRes = await listUsers(page, limit).catch(() => ({ data: null }));
    const allUsers: AdminUser[] = (usersRes.data?.data as any)?.users || [];
    const clientUsers = allUsers.filter((u) => u.role === "client");

    const synthesizedClients: AdminClientRecord[] = clientUsers.map((u) => {
      const matchedOrgs = findOrgs(orgRecords, u.id, u.email);
      return {
        id: u.id,
        user: u,
        organization: matchedOrgs[0] || null,
        organizations: matchedOrgs,
        partnerProfile: null,
        createdAt: u.createdAt,
      };
    });

    const pagination = usersRes.data?.data?.pagination || {
      currentPage: page,
      nextPage: null,
      prevPage: null,
      hasNext: false,
      hasPrev: false,
      totalPages: 1,
      totalRecords: synthesizedClients.length,
    };

    return {
      status: 200,
      ok: true,
      error: null,
      data: {
        error: false,
        message: "Clients retrieved from user directory",
        data: {
          clients: synthesizedClients,
          partners: synthesizedClients,
          records: synthesizedClients,
          pagination,
        },
      } as any,
    };
  } catch (err: any) {
    return res;
  }
}

export async function getClient(
  clientId: string
): Promise<ApiResponse<ApiEnvelope<{ client: AdminClientRecord }>>> {
  console.log(`[Clients API] getClient — GET /admin/clients/${clientId}`);
  const [res, orgsRes] = await Promise.all([
    apiRequest<ApiEnvelope<any>>(`/admin/clients/${clientId}`),
    listOrganizations(1, 100).catch(() => ({ data: null })),
  ]);

  const orgRecords: any[] = (orgsRes?.data?.data as any)?.organizations || [];

  if (res.status >= 200 && res.status < 300 && res.data) {
    const raw = res.data?.data?.client || res.data?.data || res.data;
    const user: AdminUser = raw.user || raw;
    const matchedOrgs = findOrgs(orgRecords, user.id, user.email);
    const org = raw.organization || raw.organizations?.[0] || matchedOrgs[0] || null;

    return {
      status: res.status,
      ok: true,
      error: null,
      data: {
        error: false,
        message: "Client profile retrieved",
        data: {
          client: {
            id: user.id || clientId,
            user,
            organization: org,
            organizations: raw.organizations || (matchedOrgs.length ? matchedOrgs : (org ? [org] : [])),
            partnerProfile: raw.partnerProfile || null,
            createdAt: user.createdAt || new Date().toISOString(),
          },
        },
      } as any,
    };
  }

  // Fallback: look up in /admins/users
  try {
    const usersRes = await listUsers(1, 100);
    const user = usersRes.data?.data?.users?.find((u) => u.id === clientId);
    if (user) {
      const matchedOrgs = findOrgs(orgRecords, user.id, user.email);
      return {
        status: 200,
        ok: true,
        error: null,
        data: {
          error: false,
          message: "Client retrieved",
          data: {
            client: {
              id: user.id,
              user,
              organization: matchedOrgs[0] || null,
              organizations: matchedOrgs,
              partnerProfile: null,
              createdAt: user.createdAt,
            },
          },
        } as any,
      };
    }
  } catch {}

  return res;
}

export async function deleteClient(
  clientUserId: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean }>>(
    `/admin/clients/${clientUserId}`,
    { method: "DELETE" }
  );
}
