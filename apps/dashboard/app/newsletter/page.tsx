"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@digibit/ui/components";
import { Plus, Eye, MoreHorizontal, Pencil, Trash, Send, Calendar } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@digibit/ui/components";

interface Newsletter {
    id: string;
    subject: string;
    status: "draft" | "scheduled" | "sending" | "sent";
    scheduledAt: string | null;
    sentAt: string | null;
    recipientCount: number;
    openRate: string | null;
}

const initialNewsletters: Newsletter[] = [
    {
        id: "1",
        subject: "March Product Update: New Features Added",
        status: "sent",
        scheduledAt: null,
        sentAt: "2024-03-20T10:00:00Z",
        recipientCount: 5420,
        openRate: "42%",
    },
    {
        id: "2",
        subject: "Weekly Digest: Top Tech Trends",
        status: "scheduled",
        scheduledAt: "2024-03-25T09:00:00Z",
        sentAt: null,
        recipientCount: 5500,
        openRate: null,
    },
    {
        id: "3",
        subject: "Welcome to Our New Dashboard",
        status: "draft",
        scheduledAt: null,
        sentAt: null,
        recipientCount: 0,
        openRate: null,
    },
    {
        id: "4",
        subject: "Important Security Alert",
        status: "sent",
        scheduledAt: null,
        sentAt: "2024-02-15T14:30:00Z",
        recipientCount: 5100,
        openRate: "68%",
    },
];

export default function NewsletterPage() {
    const { success, error } = useToast();
    const [newsletters, setNewsletters] = React.useState<Newsletter[]>(initialNewsletters);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = React.useState<Newsletter | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const columns: Column<Newsletter>[] = [
        {
            key: "subject",
            header: "Subject",
            sortable: true,
            render: (news) => (
                <span className="font-medium text-zinc-900 dark:text-white">{news.subject}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (news) => {
                let colorClass = "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";
                if (news.status === "sent") colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                if (news.status === "scheduled") colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                if (news.status === "sending") colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

                return (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                        {news.status.charAt(0).toUpperCase() + news.status.slice(1)}
                    </span>
                );
            },
        },
        {
            key: "recipientCount",
            header: "Recipients",
            sortable: true,
            render: (news) => (
                <span className="text-zinc-600 dark:text-zinc-400">
                    {news.recipientCount > 0 ? news.recipientCount.toLocaleString() : "-"}
                </span>
            ),
        },
        {
            key: "openRate",
            header: "Open Rate",
            sortable: true,
            render: (news) => (
                <span className="text-zinc-600 dark:text-zinc-400">
                    {news.openRate || "-"}
                </span>
            ),
        },
        {
            key: "sentAt",
            header: "Date",
            sortable: true,
            render: (news) => {
                const date = news.status === "scheduled" ? news.scheduledAt : news.sentAt;
                return (
                    <div className="flex flex-col text-sm">
                        <span className="text-zinc-900 dark:text-white">
                            {date ? new Date(date).toLocaleDateString() : "Not scheduled"}
                        </span>
                        {date && (
                            <span className="text-xs text-zinc-500">
                                {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleDelete = (newsletter: Newsletter) => {
        setSelectedNewsletter(newsletter);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedNewsletter) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setNewsletters((prev) => prev.filter((n) => n.id !== selectedNewsletter.id));
            success("Newsletter deleted", "The newsletter has been deleted successfully.");
            setIsDeleteOpen(false);
            setSelectedNewsletter(null);
        } catch {
            error("Error", "Failed to delete newsletter.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Newsletters"
                description="Manage email campaigns and newsletters"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Newsletters" },
                ]}
                actions={
                    <Link href="/newsletter/new">
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            Draft Newsletter
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataTable
                    columns={columns}
                    data={newsletters}
                    keyField="id"
                    searchPlaceholder="Search newsletters..."
                    searchFields={["subject"]}
                    actions={(news) => (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Link href={`/newsletter/${news.id}`}>
                                    <DropdownMenuItem>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                </Link>
                                {news.status === "draft" && (
                                    <DropdownMenuItem>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Now
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDelete(news)}
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
                title="Delete Newsletter"
                description="Are you sure you want to delete this newsletter? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
