"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { ConfirmModal } from "@/components/modal";
import { StatusModal } from "@/components/modals/status-modal";
import { useToast } from "@/components/toast";
import { Button } from "@digibit/ui/components";
import { Plus, Users, ShieldCheck, UserCheck, UserPlus, Edit, Eye, UserX } from "lucide-react";
import { User, UserStatus, UserRole } from "../../types/user";

const initialUsers: User[] = [
    {
        id: "1",
        email: "admin@globaldigibit.com",
        firstName: "Admin",
        lastName: "User",
        name: "Admin User",
        roles: [UserRole.SUPER_ADMIN],
        status: UserStatus.ACTIVE,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
    },
    {
        id: "2",
        email: "editor@globaldigibit.com",
        firstName: "Sarah",
        lastName: "Jenkins",
        name: "Sarah Jenkins",
        roles: [UserRole.EDITOR],
        status: UserStatus.ACTIVE,
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: "2024-01-15T14:30:00Z",
        updatedAt: "2024-01-15T14:30:00Z",
    },
    {
        id: "3",
        email: "support@globaldigibit.com",
        firstName: "Michael",
        lastName: "Chen",
        name: "Michael Chen",
        roles: [UserRole.VIEWER],
        status: UserStatus.PENDING,
        emailVerified: false,
        twoFactorEnabled: false,
        createdAt: "2024-02-01T09:15:00Z",
        updatedAt: "2024-02-01T09:15:00Z",
    },
    {
        id: "4",
        email: "external.editor@example.com",
        firstName: "Elena",
        lastName: "Rodriguez",
        name: "Elena Rodriguez",
        roles: [UserRole.EDITOR],
        status: UserStatus.INACTIVE,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: "2024-02-10T11:45:00Z",
        updatedAt: "2024-02-10T11:45:00Z",
    },
];

export default function UsersPage() {
    const { success, error } = useToast();
    const [users, setUsers] = React.useState<User[]>(initialUsers);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [isStatusOpen, setIsStatusOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const stats = {
        total: users.length,
        active: users.filter((u) => u.status === UserStatus.ACTIVE).length,
        admins: users.filter((u) => u.roles.includes(UserRole.ADMIN) || u.roles.includes(UserRole.SUPER_ADMIN)).length,
        pending: users.filter((u) => u.status === UserStatus.PENDING).length,
    };

    const columns: Column<User>[] = [
        {
            key: "name",
            header: "User",
            sortable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-xs">
                            {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {user.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "roles",
            header: "Role",
            sortable: true,
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                        <span
                            key={role}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${role === UserRole.SUPER_ADMIN
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                : role === UserRole.ADMIN
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : role === UserRole.EDITOR
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                                }`}
                        >
                            {role.replace("_", " ")}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (user) => (
                <button
                    onClick={() => {
                        setSelectedUser(user);
                        setIsStatusOpen(true);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors hover:opacity-80 ${user.status === UserStatus.ACTIVE
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : user.status === UserStatus.PENDING
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : user.status === UserStatus.INACTIVE
                                ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                >
                    {user.status}
                </button>
            ),
        },
        {
            key: "twoFactorEnabled",
            header: "Security",
            render: (user) => (
                <div className="flex items-center gap-2">
                    {user.twoFactorEnabled ? (
                        <span title="2FA Enabled">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </span>
                    ) : (
                        <span title="2FA Disabled">
                            <UserCheck className="h-4 w-4 text-zinc-300" />
                        </span>
                    )}
                    {user.emailVerified ? (
                        <CheckCircleIcon className="h-4 w-4 text-blue-500" title="Email Verified" />
                    ) : (
                        <CheckCircleIcon className="h-4 w-4 text-zinc-300" title="Email Unverified" />
                    )}
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Joined",
            sortable: true,
            render: (user) => (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            success("User deleted", `User ${selectedUser.email} has been removed.`);
            setIsDeleteOpen(false);
        } catch {
            error("Error", "Failed to delete user.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: UserStatus) => {
        if (!selectedUser) return;
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === selectedUser.id ? { ...u, status: newStatus } : u
                )
            );
            success("Status updated", `User status changed to ${newStatus}.`);
        } catch (err) {
            error("Error", "Failed to update status.");
            throw err;
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="User Management"
                description="Manage administrative and editor accounts for Global Digitalbit"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Users" },
                ]}
                actions={
                    <Link href="/users/new">
                        <PageHeaderButton icon={<UserPlus className="h-4 w-4" />}>
                            Add User
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Users"
                        value={stats.total}
                        icon={<Users className="h-5 w-5" />}
                    />
                    <StatsCard
                        title="Active Accounts"
                        value={stats.active}
                        icon={<UserCheck className="h-5 w-5" />}
                        variant="success"
                    />
                    <StatsCard
                        title="Administrators"
                        value={stats.admins}
                        icon={<ShieldCheck className="h-5 w-5" />}
                        variant="primary"
                    />
                    <StatsCard
                        title="Pending Review"
                        value={stats.pending}
                        icon={<UserPlus className="h-5 w-5" />}
                        variant="warning"
                    />
                </div>

                {/* Users Table */}
                <DataTable
                    columns={columns}
                    data={users}
                    keyField="id"
                    searchPlaceholder="Search by name or email..."
                    searchFields={["firstName", "lastName", "email"]}
                    onDelete={handleDelete}
                    actions={(user) => (
                        <div className="flex items-center gap-1">
                            <Link href={`/users/${user.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4 text-zinc-500 hover:text-primary" />
                                </Button>
                            </Link>
                        </div>
                    )}
                />

                {/* Status Update Modal */}
                <StatusModal
                    open={isStatusOpen}
                    onOpenChange={setIsStatusOpen}
                    currentStatus={selectedUser?.status || UserStatus.PENDING}
                    userName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ""}
                    onStatusChange={handleStatusUpdate}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    open={isDeleteOpen}
                    onOpenChange={setIsDeleteOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete User"
                    description={`Are you sure you want to delete account for "${selectedUser?.email}"? This action cannot be undone.`}
                    confirmLabel="Delete Account"
                    variant="danger"
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

function CheckCircleIcon({ className, title }: { className?: string, title?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{title}</title>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}
