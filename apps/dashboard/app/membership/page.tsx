"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { FormModal } from "@/components/modal";
import {
    Button,
    Input,
    Textarea,
    Switch,
    Label,
} from "@ktblog/ui/components";
import {
    Plus,
    Edit,
    Users,
    Check,
    X,
} from "lucide-react";

interface MembershipTier {
    id: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
    subscriberCount: number;
    active: boolean;
    description: string;
}

const initialTiers: MembershipTier[] = [
    {
        id: "1",
        name: "Free",
        monthlyPrice: 0,
        annualPrice: 0,
        features: ["Access to public posts", "Weekly newsletter", "Community access"],
        subscriberCount: 245,
        active: true,
        description: "Basic access to all public content.",
    },
    {
        id: "2",
        name: "Basic",
        monthlyPrice: 9,
        annualPrice: 89,
        features: [
            "All Free features",
            "Members-only posts",
            "Monthly Q&A sessions",
            "Email support",
        ],
        subscriberCount: 128,
        active: true,
        description: "Great for casual readers who want more.",
    },
    {
        id: "3",
        name: "Pro",
        monthlyPrice: 19,
        annualPrice: 189,
        features: [
            "All Basic features",
            "Full archive access",
            "Exclusive tutorials",
            "Priority support",
            "Early access to new content",
        ],
        subscriberCount: 67,
        active: true,
        description: "For dedicated readers and learners.",
    },
    {
        id: "4",
        name: "Premium",
        monthlyPrice: 49,
        annualPrice: 479,
        features: [
            "All Pro features",
            "1-on-1 consultations",
            "Custom content requests",
            "Private community",
            "Exclusive webinars",
            "Downloadable resources",
        ],
        subscriberCount: 23,
        active: true,
        description: "The ultimate experience for power users.",
    },
];

const tierAccentColors: Record<string, string> = {
    Free: "border-zinc-300 dark:border-zinc-600",
    Basic: "border-blue-400 dark:border-blue-500",
    Pro: "border-purple-400 dark:border-purple-500",
    Premium: "border-amber-400 dark:border-amber-500",
};

const tierBadgeColors: Record<string, string> = {
    Free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    Basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function MembershipPage() {
    const [tiers, setTiers] = React.useState<MembershipTier[]>(initialTiers);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingTier, setEditingTier] = React.useState<MembershipTier | null>(null);

    // Form state
    const [formName, setFormName] = React.useState("");
    const [formDescription, setFormDescription] = React.useState("");
    const [formMonthly, setFormMonthly] = React.useState("");
    const [formAnnual, setFormAnnual] = React.useState("");
    const [formFeatures, setFormFeatures] = React.useState("");

    const openCreateForm = () => {
        setEditingTier(null);
        setFormName("");
        setFormDescription("");
        setFormMonthly("");
        setFormAnnual("");
        setFormFeatures("");
        setIsFormOpen(true);
    };

    const openEditForm = (tier: MembershipTier) => {
        setEditingTier(tier);
        setFormName(tier.name);
        setFormDescription(tier.description);
        setFormMonthly(tier.monthlyPrice.toString());
        setFormAnnual(tier.annualPrice.toString());
        setFormFeatures(tier.features.join("\n"));
        setIsFormOpen(true);
    };

    const handleSave = () => {
        const tierData: MembershipTier = {
            id: editingTier?.id || String(Date.now()),
            name: formName,
            description: formDescription,
            monthlyPrice: parseFloat(formMonthly) || 0,
            annualPrice: parseFloat(formAnnual) || 0,
            features: formFeatures.split("\n").filter((f) => f.trim()),
            subscriberCount: editingTier?.subscriberCount || 0,
            active: editingTier?.active ?? true,
        };

        if (editingTier) {
            setTiers((prev) =>
                prev.map((t) => (t.id === editingTier.id ? tierData : t))
            );
        } else {
            setTiers((prev) => [...prev, tierData]);
        }
        setIsFormOpen(false);
    };

    const toggleActive = (tierId: string) => {
        setTiers((prev) =>
            prev.map((t) =>
                t.id === tierId ? { ...t, active: !t.active } : t
            )
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Membership Tiers"
                description="Manage subscription tiers and pricing for your blog"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Membership" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={openCreateForm}
                    >
                        New Tier
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative bg-white dark:bg-zinc-800 rounded-xl border-2 ${
                                tier.active
                                    ? tierAccentColors[tier.name] || "border-zinc-200 dark:border-zinc-700"
                                    : "border-zinc-200 dark:border-zinc-700 opacity-60"
                            } p-6 flex flex-col transition-shadow hover:shadow-lg`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        tierBadgeColors[tier.name] || "bg-zinc-100 text-zinc-700"
                                    }`}
                                >
                                    {tier.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={tier.active}
                                        onCheckedChange={() => toggleActive(tier.id)}
                                    />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                                        ${tier.monthlyPrice}
                                    </span>
                                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        /month
                                    </span>
                                </div>
                                {tier.annualPrice > 0 && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        ${tier.annualPrice}/year (save{" "}
                                        {Math.round(
                                            ((tier.monthlyPrice * 12 - tier.annualPrice) /
                                                (tier.monthlyPrice * 12)) *
                                                100
                                        )}
                                        %)
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                {tier.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-2 mb-6 flex-1">
                                {tier.features.map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                                    >
                                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                    <Users className="h-4 w-4" />
                                    <span>{tier.subscriberCount} subscribers</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditForm(tier)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={editingTier ? "Edit Tier" : "Create New Tier"}
                description={
                    editingTier
                        ? "Update the membership tier details"
                        : "Add a new membership tier to your blog"
                }
                size="lg"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tierName">Tier Name</Label>
                        <Input
                            id="tierName"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g., Pro"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tierDesc">Description</Label>
                        <Input
                            id="tierDesc"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Brief description of this tier"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthly">Monthly Price ($)</Label>
                            <Input
                                id="monthly"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formMonthly}
                                onChange={(e) => setFormMonthly(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="annual">Annual Price ($)</Label>
                            <Input
                                id="annual"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formAnnual}
                                onChange={(e) => setFormAnnual(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="features">Features (one per line)</Label>
                        <Textarea
                            id="features"
                            value={formFeatures}
                            onChange={(e) => setFormFeatures(e.target.value)}
                            placeholder={"Feature 1\nFeature 2\nFeature 3"}
                            rows={5}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingTier ? "Save Changes" : "Create Tier"}
                        </Button>
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
