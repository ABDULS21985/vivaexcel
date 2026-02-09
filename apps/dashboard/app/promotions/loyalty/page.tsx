"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal, FormModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
} from "@ktblog/ui/components";
import {
    Plus,
    Loader2,
    X,
    Crown,
    Pencil,
    Trash,
    Star,
    TrendingUp,
    Gift,
    ArrowRight,
} from "lucide-react";
import {
    useLoyaltyTiers,
    useCreateLoyaltyTier,
    useUpdateLoyaltyTier,
    useDeleteLoyaltyTier,
    type LoyaltyTier,
} from "@/hooks/use-promotions";

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_GRADIENT_COLORS: Record<string, string> = {
    bronze: "from-amber-600 to-amber-800",
    silver: "from-zinc-400 to-zinc-600",
    gold: "from-yellow-500 to-yellow-700",
    platinum: "from-indigo-400 to-indigo-700",
    diamond: "from-cyan-400 to-blue-600",
};

const TIER_BG_COLORS: Record<string, string> = {
    bronze: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    silver: "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600",
    gold: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    platinum: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    diamond: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
};

function getTierColor(tier: LoyaltyTier): string {
    const colorKey = tier.color?.toLowerCase() || tier.name.toLowerCase();
    return TIER_GRADIENT_COLORS[colorKey] || "from-zinc-500 to-zinc-700";
}

function getTierBg(tier: LoyaltyTier): string {
    const colorKey = tier.color?.toLowerCase() || tier.name.toLowerCase();
    return TIER_BG_COLORS[colorKey] || "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700";
}

// ─── Loyalty Tier Form Component ────────────────────────────────────────────

interface TierFormProps {
    tier?: LoyaltyTier | null;
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading: boolean;
    onCancel: () => void;
}

function TierForm({ tier, onSubmit, isLoading, onCancel }: TierFormProps) {
    const [name, setName] = React.useState(tier?.name ?? "");
    const [description, setDescription] = React.useState(tier?.description ?? "");
    const [minimumPoints, setMinimumPoints] = React.useState(tier?.minimumPoints?.toString() ?? "");
    const [discountPercentage, setDiscountPercentage] = React.useState(tier?.discountPercentage?.toString() ?? "");
    const [pointsMultiplier, setPointsMultiplier] = React.useState(tier?.pointsMultiplier?.toString() ?? "1");
    const [perks, setPerks] = React.useState(tier?.perks?.join("\n") ?? "");
    const [color, setColor] = React.useState(tier?.color ?? "");
    const [sortOrder, setSortOrder] = React.useState(tier?.sortOrder?.toString() ?? "0");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const perksList = perks
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean);
        onSubmit({
            name,
            description: description || undefined,
            minimumPoints: parseInt(minimumPoints) || 0,
            discountPercentage: parseFloat(discountPercentage) || 0,
            pointsMultiplier: parseFloat(pointsMultiplier) || 1,
            perks: perksList,
            color: color || undefined,
            sortOrder: parseInt(sortOrder) || 0,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Tier Name *
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Gold"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Color Theme
                    </label>
                    <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g. gold, silver, bronze"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                </label>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional tier description..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Minimum Points *
                    </label>
                    <Input
                        type="number"
                        value={minimumPoints}
                        onChange={(e) => setMinimumPoints(e.target.value)}
                        placeholder="e.g. 1000"
                        required
                        min="0"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Discount % *
                    </label>
                    <Input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="e.g. 10"
                        required
                        min="0"
                        max="100"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Points Multiplier
                    </label>
                    <Input
                        type="number"
                        value={pointsMultiplier}
                        onChange={(e) => setPointsMultiplier(e.target.value)}
                        placeholder="e.g. 1.5"
                        min="1"
                        step="0.1"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Perks (one per line)
                </label>
                <textarea
                    value={perks}
                    onChange={(e) => setPerks(e.target.value)}
                    placeholder={"Free shipping on all orders\nEarly access to new products\nExclusive member discounts"}
                    rows={4}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Sort Order
                </label>
                <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                    {tier ? "Update Tier" : "Create Tier"}
                </Button>
            </div>
        </form>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function LoyaltyPage() {
    const { success, error: toastError } = useToast();

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedTier, setSelectedTier] = React.useState<LoyaltyTier | null>(null);

    // Fetch data
    const { data: tiersData, isLoading, error } = useLoyaltyTiers();
    const tiers = tiersData?.items ?? [];

    // Sort tiers by sortOrder
    const sortedTiers = React.useMemo(
        () => [...tiers].sort((a, b) => a.sortOrder - b.sortOrder),
        [tiers],
    );

    // Mutations
    const createTierMutation = useCreateLoyaltyTier();
    const updateTierMutation = useUpdateLoyaltyTier();
    const deleteTierMutation = useDeleteLoyaltyTier();

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleCreate = (data: Record<string, unknown>) => {
        createTierMutation.mutate(data, {
            onSuccess: () => {
                success("Tier created", "The loyalty tier has been created successfully.");
                setIsCreateOpen(false);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to create loyalty tier.");
            },
        });
    };

    const handleEdit = (tier: LoyaltyTier) => {
        setSelectedTier(tier);
        setIsEditOpen(true);
    };

    const handleUpdate = (data: Record<string, unknown>) => {
        if (!selectedTier) return;
        updateTierMutation.mutate(
            { id: selectedTier.id, data },
            {
                onSuccess: () => {
                    success("Tier updated", "The loyalty tier has been updated successfully.");
                    setIsEditOpen(false);
                    setSelectedTier(null);
                },
                onError: (err) => {
                    toastError("Error", err.message || "Failed to update loyalty tier.");
                },
            },
        );
    };

    const handleDeleteClick = (tier: LoyaltyTier) => {
        setSelectedTier(tier);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedTier) return;
        deleteTierMutation.mutate(selectedTier.id, {
            onSuccess: () => {
                success("Tier deleted", `Tier "${selectedTier.name}" has been deleted.`);
                setIsDeleteOpen(false);
                setSelectedTier(null);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to delete loyalty tier.");
            },
        });
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Loyalty Program"
                description="Configure loyalty tiers and rewards for your customers"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Promotions", href: "/promotions/coupons" },
                    { label: "Loyalty" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Add Tier
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading loyalty tiers...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load loyalty tiers
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error.message || "An error occurred while fetching loyalty tiers."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                        {sortedTiers.length > 0 ? (
                            <>
                                {/* Tier comparison overview */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                            Tier Comparison
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            Overview of all loyalty tiers and their benefits
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Tier
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Min Points
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Discount
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Points Multiplier
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Perks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {sortedTiers.map((tier, index) => (
                                                    <tr key={tier.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getTierColor(tier)} flex items-center justify-center`}>
                                                                    <Crown className="h-4 w-4 text-white" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                                    {tier.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                            {tier.minimumPoints.toLocaleString()} pts
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
                                                            {tier.discountPercentage}%
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                            {tier.pointsMultiplier}x
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                            {tier.perks.length} perks
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tier progression flow */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    {sortedTiers.map((tier, index) => (
                                        <React.Fragment key={tier.id}>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${getTierBg(tier)}`}>
                                                <Crown className="h-4 w-4" />
                                                {tier.name}
                                                <span className="text-xs opacity-70">
                                                    ({tier.minimumPoints.toLocaleString()} pts)
                                                </span>
                                            </div>
                                            {index < sortedTiers.length - 1 && (
                                                <ArrowRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Tier detail cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {sortedTiers.map((tier) => (
                                        <div
                                            key={tier.id}
                                            className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${getTierBg(tier)}`}
                                        >
                                            {/* Gradient header */}
                                            <div className={`bg-gradient-to-r ${getTierColor(tier)} p-5`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                                            <Crown className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">
                                                                {tier.name}
                                                            </h3>
                                                            <p className="text-sm text-white/70">
                                                                {tier.minimumPoints.toLocaleString()} points required
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEdit(tier)}
                                                            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                                            title="Edit tier"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(tier)}
                                                            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                                            title="Delete tier"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                {tier.description && (
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                                        {tier.description}
                                                    </p>
                                                )}

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className="bg-white/60 dark:bg-zinc-800/60 rounded-lg p-3">
                                                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                                                            <Star className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] uppercase tracking-wider font-medium">
                                                                Discount
                                                            </span>
                                                        </div>
                                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                                            {tier.discountPercentage}%
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/60 dark:bg-zinc-800/60 rounded-lg p-3">
                                                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] uppercase tracking-wider font-medium">
                                                                Multiplier
                                                            </span>
                                                        </div>
                                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                                            {tier.pointsMultiplier}x
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Perks */}
                                                {tier.perks.length > 0 && (
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2">
                                                            Perks
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {tier.perks.map((perk, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                                                                >
                                                                    <Gift className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                                                    {perk}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Crown className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No loyalty tiers configured
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    Set up loyalty tiers to reward your most loyal customers with exclusive benefits.
                                </p>
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="mt-4"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Tier
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Tier Modal */}
            <FormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Create Loyalty Tier"
                description="Add a new tier to your loyalty program."
                size="xl"
            >
                <TierForm
                    onSubmit={handleCreate}
                    isLoading={createTierMutation.isPending}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </FormModal>

            {/* Edit Tier Modal */}
            <FormModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                title="Edit Loyalty Tier"
                description="Update the tier configuration."
                size="xl"
            >
                <TierForm
                    tier={selectedTier}
                    onSubmit={handleUpdate}
                    isLoading={updateTierMutation.isPending}
                    onCancel={() => {
                        setIsEditOpen(false);
                        setSelectedTier(null);
                    }}
                />
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Loyalty Tier"
                description={
                    selectedTier
                        ? `Are you sure you want to delete the "${selectedTier.name}" tier? Members in this tier may need to be reassigned.`
                        : "Are you sure you want to delete this tier?"
                }
                confirmLabel="Delete Tier"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                isLoading={deleteTierMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
