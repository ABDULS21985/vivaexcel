import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  Team,
  TeamMember,
  TeamInvitation,
  TeamPurchase,
  SharedLibraryItem,
  TeamLicense,
  TeamStats,
  VolumeDiscount,
  VolumeCalculation,
  ApiResponseWrapper,
  TeamMemberRole,
} from "@/types/team";

// =============================================================================
// Query Keys
// =============================================================================

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: () => [...teamKeys.lists()] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
  stats: (id: string) => [...teamKeys.all, "stats", id] as const,
  members: (teamId: string) => [...teamKeys.all, "members", teamId] as const,
  invitations: (teamId: string) =>
    [...teamKeys.all, "invitations", teamId] as const,
  library: (teamId: string, filters?: Record<string, unknown>) =>
    [...teamKeys.all, "library", teamId, filters] as const,
  purchases: (teamId: string, filters?: Record<string, unknown>) =>
    [...teamKeys.all, "purchases", teamId, filters] as const,
  pendingApprovals: (teamId: string) =>
    [...teamKeys.all, "pending-approvals", teamId] as const,
  licenses: (teamId: string) =>
    [...teamKeys.all, "licenses", teamId] as const,
  volumeDiscounts: () => [...teamKeys.all, "volume-discounts"] as const,
};

// =============================================================================
// Team Queries
// =============================================================================

export function useMyTeams() {
  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<Team[]>>("/teams");
      return res.data ?? [];
    },
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<Team>>(`/teams/${teamId}`);
      return res.data ?? null;
    },
    enabled: !!teamId,
  });
}

export function useTeamStats(teamId: string) {
  return useQuery({
    queryKey: teamKeys.stats(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<TeamStats>>(
        `/teams/${teamId}/stats`
      );
      return res.data ?? null;
    },
    enabled: !!teamId,
  });
}

// =============================================================================
// Member Queries
// =============================================================================

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<TeamMember[]>>(
        `/teams/${teamId}/members`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

export function usePendingInvitations(teamId: string) {
  return useQuery({
    queryKey: teamKeys.invitations(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<TeamInvitation[]>>(
        `/teams/${teamId}/members/invitations`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

// =============================================================================
// Library Queries
// =============================================================================

export function useTeamLibrary(
  teamId: string,
  filters?: { search?: string; cursor?: string; limit?: number }
) {
  return useQuery({
    queryKey: teamKeys.library(teamId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.cursor) params.set("cursor", filters.cursor);
      if (filters?.limit) params.set("limit", String(filters.limit));
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiGet<ApiResponseWrapper<SharedLibraryItem[]>>(
        `/teams/${teamId}/library${query}`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

// =============================================================================
// Purchase Queries
// =============================================================================

export function useTeamPurchases(
  teamId: string,
  filters?: { cursor?: string; limit?: number }
) {
  return useQuery({
    queryKey: teamKeys.purchases(teamId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.cursor) params.set("cursor", filters.cursor);
      if (filters?.limit) params.set("limit", String(filters.limit));
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiGet<ApiResponseWrapper<TeamPurchase[]>>(
        `/teams/${teamId}/purchases${query}`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

export function usePendingApprovals(teamId: string) {
  return useQuery({
    queryKey: teamKeys.pendingApprovals(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<TeamPurchase[]>>(
        `/teams/${teamId}/purchases/pending`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

// =============================================================================
// License Queries
// =============================================================================

export function useTeamLicenses(teamId: string) {
  return useQuery({
    queryKey: teamKeys.licenses(teamId),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<TeamLicense[]>>(
        `/teams/${teamId}/licenses`
      );
      return res.data ?? [];
    },
    enabled: !!teamId,
  });
}

// =============================================================================
// Volume Discount Queries
// =============================================================================

export function useVolumeDiscountTiers() {
  return useQuery({
    queryKey: teamKeys.volumeDiscounts(),
    queryFn: async () => {
      const res = await apiGet<ApiResponseWrapper<VolumeDiscount[]>>(
        "/volume-discounts"
      );
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVolumeCalculation(
  unitPrice: number,
  quantity: number,
  productId?: string
) {
  return useQuery({
    queryKey: ["volume-calculation", unitPrice, quantity, productId],
    queryFn: async () => {
      const params = new URLSearchParams({
        unitPrice: String(unitPrice),
        quantity: String(quantity),
      });
      if (productId) params.set("productId", productId);
      const res = await apiGet<ApiResponseWrapper<VolumeCalculation>>(
        `/volume-discounts/calculate?${params.toString()}`
      );
      return res.data ?? null;
    },
    enabled: unitPrice > 0 && quantity > 0,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      slug: string;
      description?: string;
      logoUrl?: string;
      plan?: string;
      billingEmail?: string;
    }) => apiPost<ApiResponseWrapper<Team>>("/teams", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Team>) =>
      apiPatch<ApiResponseWrapper<Team>>(`/teams/${teamId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId) });
    },
  });
}

export function useUpdateTeamSettings(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPatch<ApiResponseWrapper<Team>>(`/teams/${teamId}/settings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
}

export function useInviteMembers(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { emails: string[]; role?: TeamMemberRole }) =>
      apiPost<ApiResponseWrapper<TeamInvitation[]>>(
        `/teams/${teamId}/members/invite`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
    },
  });
}

export function useAcceptInvitation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiPost<ApiResponseWrapper<TeamMember>>(
        `/teams/${teamId}/members/accept-invitation/${token}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
    },
  });
}

export function useUpdateMemberRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      role,
      permissions,
    }: {
      memberId: string;
      role: TeamMemberRole;
      permissions?: Record<string, boolean>;
    }) =>
      apiPatch<ApiResponseWrapper<TeamMember>>(
        `/teams/${teamId}/members/${memberId}/role`,
        { role, permissions }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
    },
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      apiDelete<ApiResponseWrapper<null>>(
        `/teams/${teamId}/members/${memberId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId) });
    },
  });
}

export function useRevokeInvitation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiDelete<ApiResponseWrapper<null>>(
        `/teams/${teamId}/members/invitations/${invitationId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(teamId) });
    },
  });
}

export function useRequestPurchase(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      digitalProductId: string;
      requestNote?: string;
      seatCount?: number;
    }) =>
      apiPost<ApiResponseWrapper<TeamPurchase>>(
        `/teams/${teamId}/purchases/request`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.purchases(teamId) });
      queryClient.invalidateQueries({
        queryKey: teamKeys.pendingApprovals(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId) });
    },
  });
}

export function useApprovePurchase(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      purchaseId,
      approvalNote,
    }: {
      purchaseId: string;
      approvalNote?: string;
    }) =>
      apiPost<ApiResponseWrapper<TeamPurchase>>(
        `/teams/${teamId}/purchases/${purchaseId}/approve`,
        { approvalNote }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.purchases(teamId) });
      queryClient.invalidateQueries({
        queryKey: teamKeys.pendingApprovals(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.library(teamId) });
    },
  });
}

export function useRejectPurchase(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      purchaseId,
      approvalNote,
    }: {
      purchaseId: string;
      approvalNote: string;
    }) =>
      apiPost<ApiResponseWrapper<TeamPurchase>>(
        `/teams/${teamId}/purchases/${purchaseId}/reject`,
        { approvalNote }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.pendingApprovals(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.purchases(teamId) });
    },
  });
}

export function useAddToLibrary(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      digitalProductId: string;
      licenseId?: string;
      notes?: string;
      tags?: string[];
    }) =>
      apiPost<ApiResponseWrapper<SharedLibraryItem>>(
        `/teams/${teamId}/library`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.library(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId) });
    },
  });
}

export function useActivateSeat(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (licenseId: string) =>
      apiPost<ApiResponseWrapper<TeamLicense>>(
        `/teams/${teamId}/licenses/${licenseId}/activate`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.licenses(teamId) });
    },
  });
}

export function useDeactivateSeat(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (licenseId: string) =>
      apiPost<ApiResponseWrapper<TeamLicense>>(
        `/teams/${teamId}/licenses/${licenseId}/deactivate`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.licenses(teamId) });
    },
  });
}
