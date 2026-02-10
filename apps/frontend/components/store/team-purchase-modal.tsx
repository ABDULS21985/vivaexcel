"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, X, ShoppingCart, Percent } from "lucide-react";
import { Button, Badge } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import {
  useRequestPurchase,
  useVolumeCalculation,
} from "@/hooks/use-teams";

interface TeamPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    currency?: string;
  };
}

export function TeamPurchaseModal({
  isOpen,
  onClose,
  product,
}: TeamPurchaseModalProps) {
  const t = useTranslations("team.store");
  const { activeTeam, teams, setActiveTeamId, canPurchase } = useTeamContext();

  const [seatCount, setSeatCount] = useState(1);
  const [requestNote, setRequestNote] = useState("");

  const teamId = activeTeam?.id || "";
  const requestPurchase = useRequestPurchase(teamId);

  const { data: volumeCalc } = useVolumeCalculation(
    product.price,
    seatCount,
    product.id
  );

  const handlePurchase = () => {
    if (!teamId) return;
    requestPurchase.mutate(
      {
        digitalProductId: product.id,
        seatCount,
        requestNote: requestNote || undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl sm:inset-x-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                {t("buyForTeam")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Product Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-semibold">{product.title}</p>
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)} / {t("perSeat")}
                </p>
              </div>

              {/* Team Selector */}
              {teams.length > 1 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t("selectTeam")}
                  </label>
                  <select
                    className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                    value={teamId}
                    onChange={(e) => setActiveTeamId(e.target.value)}
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seat Selector */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("howManySeats")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={seatCount}
                    onChange={(e) => setSeatCount(parseInt(e.target.value, 10))}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-lg font-bold">
                    {seatCount}
                  </span>
                </div>
              </div>

              {/* Volume Discount Preview */}
              {volumeCalc && volumeCalc.discountPercentage > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
                >
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {t("volumeDiscount")}: {volumeCalc.discountPercentage}%{" "}
                      {t("off")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                    {t("youSave")}: ${volumeCalc.savings.toFixed(2)}
                  </p>
                </motion.div>
              )}

              {/* Request Note */}
              {activeTeam?.purchaseApprovalRequired && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t("requestNote")}
                  </label>
                  <textarea
                    className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                    rows={2}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder={t("requestNotePlaceholder")}
                  />
                </div>
              )}

              {/* Price Summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("unitPrice")}</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("quantity")}</span>
                  <span>&times; {seatCount}</span>
                </div>
                {volumeCalc && volumeCalc.discountPercentage > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t("discount")}</span>
                    <span>-${volumeCalc.savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-border/50 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>{t("total")}</span>
                    <span>
                      $
                      {volumeCalc
                        ? volumeCalc.totalPrice.toFixed(2)
                        : (product.price * seatCount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <Button
                className="w-full"
                onClick={handlePurchase}
                disabled={!canPurchase || requestPurchase.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {activeTeam?.purchaseApprovalRequired
                  ? t("submitRequest")
                  : t("purchaseForTeam")}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
