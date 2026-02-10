"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useMyTeams } from "@/hooks/use-teams";
import type { Team, TeamMember, TeamMemberPermissions } from "@/types/team";
import { TeamMemberRole } from "@/types/team";

// =============================================================================
// Context Type
// =============================================================================

interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeamId: (teamId: string) => void;
  isLoading: boolean;
  // Permission helpers
  teamRole: TeamMemberRole | null;
  permissions: TeamMemberPermissions | null;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canPurchase: boolean;
  canDownload: boolean;
  canManageMembers: boolean;
  canViewAnalytics: boolean;
  canApproveRequests: boolean;
}

const TeamContext = createContext<TeamContextType | null>(null);

const ACTIVE_TEAM_KEY = "vivaexcel_active_team";

// =============================================================================
// Provider
// =============================================================================

export function TeamProvider({ children }: { children: ReactNode }) {
  const { data: teams = [], isLoading } = useMyTeams();
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Load persisted team on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(ACTIVE_TEAM_KEY);
    if (stored) setActiveTeamId(stored);
  }, []);

  // Auto-select first team if none selected
  useEffect(() => {
    if (!activeTeamId && teams.length > 0) {
      setActiveTeamId(teams[0].id);
    }
  }, [teams, activeTeamId]);

  // Persist selection
  const handleSetActiveTeamId = (teamId: string) => {
    setActiveTeamId(teamId);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
    }
  };

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? null,
    [teams, activeTeamId]
  );

  // For now, role/permissions are derived from the team owner
  // In a full implementation, this would come from the member endpoint
  const teamRole = useMemo(() => {
    if (!activeTeam) return null;
    // This is a simplification - in practice, fetch current user's membership
    return TeamMemberRole.OWNER;
  }, [activeTeam]);

  const permissions = useMemo((): TeamMemberPermissions | null => {
    if (!teamRole) return null;
    // Default permissions by role
    const defaults: Record<TeamMemberRole, TeamMemberPermissions> = {
      [TeamMemberRole.OWNER]: {
        canPurchase: true,
        canDownload: true,
        canManageMembers: true,
        canViewAnalytics: true,
        canApproveRequests: true,
      },
      [TeamMemberRole.ADMIN]: {
        canPurchase: true,
        canDownload: true,
        canManageMembers: true,
        canViewAnalytics: true,
        canApproveRequests: true,
      },
      [TeamMemberRole.MANAGER]: {
        canPurchase: true,
        canDownload: true,
        canManageMembers: false,
        canViewAnalytics: true,
        canApproveRequests: true,
      },
      [TeamMemberRole.MEMBER]: {
        canPurchase: true,
        canDownload: true,
        canManageMembers: false,
        canViewAnalytics: false,
        canApproveRequests: false,
      },
      [TeamMemberRole.VIEWER]: {
        canPurchase: false,
        canDownload: false,
        canManageMembers: false,
        canViewAnalytics: false,
        canApproveRequests: false,
      },
    };
    return defaults[teamRole];
  }, [teamRole]);

  const value = useMemo(
    (): TeamContextType => ({
      teams,
      activeTeam,
      setActiveTeamId: handleSetActiveTeamId,
      isLoading,
      teamRole,
      permissions,
      isOwner: teamRole === TeamMemberRole.OWNER,
      isAdmin:
        teamRole === TeamMemberRole.OWNER || teamRole === TeamMemberRole.ADMIN,
      isManager:
        teamRole === TeamMemberRole.OWNER ||
        teamRole === TeamMemberRole.ADMIN ||
        teamRole === TeamMemberRole.MANAGER,
      canPurchase: permissions?.canPurchase ?? false,
      canDownload: permissions?.canDownload ?? false,
      canManageMembers: permissions?.canManageMembers ?? false,
      canViewAnalytics: permissions?.canViewAnalytics ?? false,
      canApproveRequests: permissions?.canApproveRequests ?? false,
    }),
    [teams, activeTeam, isLoading, teamRole, permissions]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
}
