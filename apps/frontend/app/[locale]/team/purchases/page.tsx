"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import {
  useTeamPurchases,
  usePendingApprovals,
  useApprovePurchase,
  useRejectPurchase,
} from "@/hooks/use-teams";
import { TeamPurchaseStatus } from "@/types/team";

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TeamPurchaseStatus }) {
  const colors = {
    [TeamPurchaseStatus.PENDING_APPROVAL]:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    [TeamPurchaseStatus.APPROVED]:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [TeamPurchaseStatus.REJECTED]:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const icons = {
    [TeamPurchaseStatus.PENDING_APPROVAL]: Clock,
    [TeamPurchaseStatus.APPROVED]: CheckCircle,
    [TeamPurchaseStatus.REJECTED]: XCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
    >
      <Icon className="h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamPurchasesPage() {
  const t = useTranslations("team.purchases");
  const { activeTeam, canApproveRequests } = useTeamContext();
  const teamId = activeTeam?.id || "";

  const [activeTab, setActiveTab] = useState<"pending" | "history">(
    canApproveRequests ? "pending" : "history"
  );
  const [rejectNote, setRejectNote] = useState("");
  const [approveNote, setApproveNote] = useState("");

  const { data: pending = [] } = usePendingApprovals(teamId);
  const { data: history = [] } = useTeamPurchases(teamId);
  const approveMutation = useApprovePurchase(teamId);
  const rejectMutation = useRejectPurchase(teamId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {canApproveRequests && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("pendingApprovals")} ({pending.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab("history")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("purchaseHistory")}
        </button>
      </div>

      {/* Pending Approvals */}
      {activeTab === "pending" && canApproveRequests && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("noPending")}
            </div>
          ) : (
            pending.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/50 bg-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {purchase.digitalProduct?.title || t("unknownProduct")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${Number(purchase.amount).toFixed(2)} &middot;{" "}
                      {purchase.seatCount} {t("seats")} &middot;{" "}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                    {purchase.requestNote && (
                      <p className="mt-2 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        {purchase.requestNote}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={purchase.status} />
                </div>

                {/* Approval Actions */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Input
                    placeholder={t("approvalNotePlaceholder")}
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        approveMutation.mutate({
                          purchaseId: purchase.id,
                          approvalNote: approveNote || undefined,
                        })
                      }
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t("approve")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const note = rejectNote || prompt(t("rejectReasonPrompt"));
                        if (note) {
                          rejectMutation.mutate({
                            purchaseId: purchase.id,
                            approvalNote: note,
                          });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t("reject")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Purchase History */}
      {activeTab === "history" && (
        <div className="rounded-xl border border-border/50 bg-card">
          <div className="divide-y divide-border/50">
            {history.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                {t("noHistory")}
              </div>
            ) : (
              history.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <ShoppingCart className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {purchase.digitalProduct?.title || t("unknownProduct")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(purchase.createdAt).toLocaleDateString()} &middot;{" "}
                      {purchase.seatCount} {t("seats")}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${Number(purchase.amount).toFixed(2)}
                  </p>
                  <StatusBadge status={purchase.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
