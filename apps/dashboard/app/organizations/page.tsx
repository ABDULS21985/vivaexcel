"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@digibit/ui/components";
import { Plus, Building, MoreHorizontal, Pencil, Trash, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@digibit/ui/components";

interface Organization {
    id: string;
    name: string;
    slug: string;
    website: string | null;
    memberCount: number;
    isActive: boolean;
    createdAt: string;
}

const initialOrganizations: Organization[] = [
    {
        id: "1",
        name: "Acme Corp",
        slug: "acme-corp",
        website: "https://acme.com",
        memberCount: 12,
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
    },
    {
        id: "2",
        name: "Globex Inc",
        slug: "globex",
        website: "https://globex.com",
        memberCount: 45,
        isActive: true,
        createdAt: "2023-11-20T09:30:00Z",
    },
    {
        id: "3",
        name: "Soylent Corp",
        slug: "soylent",
        website: null,
        memberCount: 5,
        isActive: false,
        createdAt: "2024-02-10T14:15:00Z",
    },
];

export default function OrganizationsPage() {
    const { success, error } = useToast();
    const [organizations, setOrganizations] = React.useState<Organization[]>(initialOrganizations);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const columns: Column<Organization>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            render: (org) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Building className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-zinc-900 dark:text-white">{org.name}</div>
                        <div className="text-xs text-zinc-500">{org.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "isActive",
            header: "Status",
            sortable: true,
            render: (org) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${org.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                >
                    {org.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "memberCount",
            header: "Members",
            sortable: true,
            render: (org) => (
                <span className="text-zinc-600 dark:text-zinc-400">
                    {org.memberCount} members
                </span>
            ),
        },
        {
            key: "website",
            header: "Website",
            render: (org) => (
                org.website ? (
                    <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                    </a>
                ) : (
                    <span className="text-zinc-400 text-sm">-</span>
                )
            ),
        },
        {
            key: "createdAt",
            header: "Joined",
            sortable: true,
            render: (org) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(org.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

    const handleDelete = (org: Organization) => {
        setSelectedOrg(org);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedOrg) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
            success("Organization deleted", "The organization has been deleted successfully.");
            setIsDeleteOpen(false);
            setSelectedOrg(null);
        } catch {
            error("Error", "Failed to delete organization.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Organizations"
                description="Manage partner organizations and clients"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Organizations" },
                ]}
                actions={
                    <Link href="/organizations/new">
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            Add Organization
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataTable
                    columns={columns}
                    data={organizations}
                    keyField="id"
                    searchPlaceholder="Search organizations..."
                    searchFields={["name", "slug"]}
                    actions={(org) => (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Link href={`/organizations/${org.id}`}>
                                    <DropdownMenuItem>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDelete(org)}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                />
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Organization"
                description={`Are you sure you want to delete "${selectedOrg?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
