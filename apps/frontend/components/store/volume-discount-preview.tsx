"use client";

import { useTranslations } from "next-intl";
import { Percent } from "lucide-react";
import { useVolumeDiscountTiers } from "@/hooks/use-teams";

export function VolumeDiscountPreview() {
  const t = useTranslations("team.store");
  const { data: tiers = [] } = useVolumeDiscountTiers();

  if (tiers.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Percent className="h-4 w-4 text-primary" />
        {t("volumeDiscountsTitle")}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("volumeDiscountsDesc")}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-lg border border-border/50 p-3 text-center transition-colors hover:border-primary/50"
          >
            <p className="text-xs text-muted-foreground">
              {tier.minQuantity}
              {tier.maxQuantity ? `-${tier.maxQuantity}` : "+"}{" "}
              {t("licenses")}
            </p>
            <p className="mt-0.5 text-xl font-bold text-primary">
              {Number(tier.discountPercentage)}%
            </p>
            <p className="text-[10px] text-muted-foreground">{t("off")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
