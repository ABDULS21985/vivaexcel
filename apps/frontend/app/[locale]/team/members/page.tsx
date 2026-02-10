"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserPlus, MoreVertical, Mail, Shield, Clock, X } from "lucide-react";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import {
  useTeamMembers,
  usePendingInvitations,
  useInviteMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useRevokeInvitation,
} from "@/hooks/use-teams";
import { TeamMemberRole } from "@/types/team";

// ─── Role Badge Colors ──────────────────────────────────────────────────────

const roleBadgeColors: Record<TeamMemberRole, string> = {
  [TeamMemberRole.OWNER]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [TeamMemberRole.ADMIN]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [TeamMemberRole.MANAGER]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  [TeamMemberRole.MEMBER]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [TeamMemberRole.VIEWER]: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const t = useTranslations("team.members");
  const { activeTeam, isAdmin } = useTeamContext();
  const teamId = activeTeam?.id || "";

  const { data: members = [] } = useTeamMembers(teamId);
  const { data: invitations = [] } = usePendingInvitations(teamId);
  const inviteMutation = useInviteMembers(teamId);
  const updateRoleMutation = useUpdateMemberRole(teamId);
  const removeMemberMutation = useRemoveMember(teamId);
  const revokeInvitationMutation = useRevokeInvitation(teamId);

  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>(TeamMemberRole.MEMBER);

  const handleInvite = () => {
    const emails = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return;
    inviteMutation.mutate({ emails, role: selectedRole }, {
      onSuccess: () => setEmailInput(""),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Invite Form */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h2 className="mb-4 font-semibold">{t("inviteTitle")}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder={t("emailPlaceholder")}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1"
            />
            <select
              className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as TeamMemberRole)}
            >
              <option value={TeamMemberRole.MEMBER}>{t("roleMember")}</option>
              <option value={TeamMemberRole.VIEWER}>{t("roleViewer")}</option>
              <option value={TeamMemberRole.MANAGER}>{t("roleManager")}</option>
              <option value={TeamMemberRole.ADMIN}>{t("roleAdmin")}</option>
            </select>
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("sendInvites")}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="font-semibold">
              {t("pendingInvitations")} ({invitations.length})
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {t("expires")}{" "}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="text-xs">{inv.role}</Badge>
                {isAdmin && (
                  <button
                    onClick={() => revokeInvitationMutation.mutate(inv.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="rounded-xl border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">
            {t("membersList")} ({members.length})
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 px-5 py-3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {member.user?.firstName?.[0] || member.user?.email?.[0] || "?"}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {member.user
                    ? `${member.user.firstName} ${member.user.lastName}`
                    : t("unknownUser")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.user?.email}
                </p>
              </div>

              {/* Role Badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  roleBadgeColors[member.role]
                }`}
              >
                <Shield className="h-3 w-3" />
                {member.role}
              </span>

              {/* Spend */}
              <div className="hidden text-right sm:block">
                <p className="text-xs text-muted-foreground">
                  ${Number(member.currentMonthSpend).toFixed(2)}{" "}
                  {member.spendLimit && (
                    <span>/ ${Number(member.spendLimit).toFixed(2)}</span>
                  )}
                </p>
              </div>

              {/* Last Active */}
              <div className="hidden text-right md:block">
                <p className="text-xs text-muted-foreground">
                  {member.lastActiveAt
                    ? new Date(member.lastActiveAt).toLocaleDateString()
                    : t("neverActive")}
                </p>
              </div>

              {/* Actions (admin only) */}
              {isAdmin && member.role !== TeamMemberRole.OWNER && (
                <div className="flex gap-1">
                  <select
                    className="rounded border border-border/50 bg-background px-2 py-1 text-xs"
                    value={member.role}
                    onChange={(e) =>
                      updateRoleMutation.mutate({
                        memberId: member.id,
                        role: e.target.value as TeamMemberRole,
                      })
                    }
                  >
                    <option value={TeamMemberRole.VIEWER}>{t("roleViewer")}</option>
                    <option value={TeamMemberRole.MEMBER}>{t("roleMember")}</option>
                    <option value={TeamMemberRole.MANAGER}>{t("roleManager")}</option>
                    <option value={TeamMemberRole.ADMIN}>{t("roleAdmin")}</option>
                  </select>
                  <button
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
