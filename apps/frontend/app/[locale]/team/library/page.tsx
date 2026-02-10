"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Package,
  Plus,
} from "lucide-react";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import { useTeamLibrary, useTeamLicenses } from "@/hooks/use-teams";
import { Link } from "@/i18n/routing";

export default function TeamLibraryPage() {
  const t = useTranslations("team.library");
  const { activeTeam, canDownload } = useTeamContext();
  const teamId = activeTeam?.id || "";

  const [search, setSearch] = useState("");
  const { data: items = [] } = useTeamLibrary(teamId, { search: search || undefined });
  const { data: licenses = [] } = useTeamLicenses(teamId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {activeTeam?.purchaseApprovalRequired && (
          <Link href="/team/purchases">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t("requestProduct")}
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptySubtitle")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const license = licenses.find(
              (l) => l.digitalProductId === item.digitalProductId
            );
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-border/50 bg-card"
              >
                {/* Image */}
                <div className="aspect-video bg-muted">
                  {item.digitalProduct?.featuredImage && (
                    <img
                      src={item.digitalProduct.featuredImage}
                      alt={item.digitalProduct.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="truncate font-semibold">
                    {item.digitalProduct?.title || t("untitled")}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>
                      {item.accessCount} {t("accesses")}
                    </span>
                    {license && (
                      <>
                        <span>&middot;</span>
                        <span>
                          {license.usedSeats}/{license.seatCount} {t("seats")}
                        </span>
                      </>
                    )}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {canDownload && (
                    <Button size="sm" className="mt-3 w-full">
                      <Download className="mr-2 h-3.5 w-3.5" />
                      {t("download")}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
