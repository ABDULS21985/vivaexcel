"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Save,
  Shield,
  Globe,
  ShoppingCart,
  Users,
  Lock,
} from "lucide-react";
import { Button, Input, Badge } from "@ktblog/ui/components";
import { useTeamContext } from "@/providers/team-provider";
import { useUpdateTeam, useUpdateTeamSettings } from "@/hooks/use-teams";
import { TeamPlan } from "@/types/team";

export default function TeamSettingsPage() {
  const t = useTranslations("team.settings");
  const { activeTeam, isAdmin, isOwner } = useTeamContext();
  const teamId = activeTeam?.id || "";

  const updateTeam = useUpdateTeam(teamId);
  const updateSettings = useUpdateTeamSettings(teamId);

  // Form state
  const [name, setName] = useState(activeTeam?.name || "");
  const [description, setDescription] = useState(activeTeam?.description || "");
  const [logoUrl, setLogoUrl] = useState(activeTeam?.logoUrl || "");
  const [purchaseApproval, setPurchaseApproval] = useState(
    activeTeam?.purchaseApprovalRequired ?? false
  );
  const [sharedLibrary, setSharedLibrary] = useState(
    activeTeam?.sharedLibraryEnabled ?? true
  );
  const [domainInput, setDomainInput] = useState("");

  const handleSaveProfile = () => {
    updateTeam.mutate({ name, description, logoUrl });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate({
      purchaseApprovalRequired: purchaseApproval,
      sharedLibraryEnabled: sharedLibrary,
    });
  };

  const handleAddDomain = () => {
    if (!domainInput.trim()) return;
    const domains = [...(activeTeam?.verifiedDomains || []), domainInput.trim()];
    updateSettings.mutate({ verifiedDomains: domains });
    setDomainInput("");
  };

  const isEnterprise = activeTeam?.plan === TeamPlan.TEAM_ENTERPRISE;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Team Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Users className="h-4 w-4" />
          {t("teamProfile")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("teamName")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("description")}</label>
            <textarea
              className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("logoUrl")}</label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={!isAdmin}
            />
          </div>
          {isAdmin && (
            <Button onClick={handleSaveProfile} disabled={updateTeam.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {t("saveProfile")}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Purchase Settings */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-4 w-4" />
          {t("purchaseSettings")}
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={purchaseApproval}
              onChange={(e) => setPurchaseApproval(e.target.checked)}
              disabled={!isAdmin}
              className="h-4 w-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium">{t("requireApproval")}</p>
              <p className="text-xs text-muted-foreground">
                {t("requireApprovalDesc")}
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={sharedLibrary}
              onChange={(e) => setSharedLibrary(e.target.checked)}
              disabled={!isAdmin}
              className="h-4 w-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium">{t("enableLibrary")}</p>
              <p className="text-xs text-muted-foreground">
                {t("enableLibraryDesc")}
              </p>
            </div>
          </label>
          {isAdmin && (
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {t("saveSettings")}
            </Button>
          )}
        </div>
      </div>

      {/* Domain Verification */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Globe className="h-4 w-4" />
          {t("domainVerification")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("domainDesc")}
        </p>

        {/* Verified Domains */}
        {activeTeam?.verifiedDomains && activeTeam.verifiedDomains.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeTeam.verifiedDomains.map((domain) => (
              <Badge key={domain} variant="outline" className="text-sm">
                {domain}
                {activeTeam.domainVerified && (
                  <span className="ml-1 text-green-500">&#10003;</span>
                )}
              </Badge>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-2">
            <Input
              placeholder={t("domainPlaceholder")}
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
            />
            <Button onClick={handleAddDomain} variant="outline">
              {t("addDomain")}
            </Button>
          </div>
        )}
      </div>

      {/* SSO Configuration (Enterprise only) */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4" />
          {t("ssoConfig")}
          {!isEnterprise && (
            <Badge variant="outline" className="ml-2 text-xs">
              {t("enterpriseOnly")}
            </Badge>
          )}
        </h2>
        {isEnterprise ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("ssoProvider")}
              </label>
              <select
                className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                defaultValue={activeTeam?.ssoProvider || ""}
                disabled={!isOwner}
              >
                <option value="">{t("selectProvider")}</option>
                <option value="okta">Okta</option>
                <option value="azure_ad">Azure AD</option>
                <option value="onelogin">OneLogin</option>
                <option value="custom">Custom SAML 2.0</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("idpUrl")}
              </label>
              <Input
                placeholder="https://idp.example.com/sso/saml"
                disabled={!isOwner}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("certificate")}
              </label>
              <textarea
                className="w-full rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-xs"
                rows={4}
                placeholder="-----BEGIN CERTIFICATE-----"
                disabled={!isOwner}
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activeTeam?.ssoEnabled ?? false}
                disabled={!isOwner}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <p className="text-sm font-medium">{t("enforceSso")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("enforceSsoDesc")}
                </p>
              </div>
            </label>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("ssoUpgradeMessage")}
          </p>
        )}
      </div>
    </div>
  );
}
