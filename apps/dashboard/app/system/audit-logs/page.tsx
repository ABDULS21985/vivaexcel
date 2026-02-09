"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { Activity, ShieldAlert, User, Database } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target: string;
    timestamp: string;
    status: "success" | "failure";
    metadata: string;
}

const initialLogs: AuditLog[] = [
    {
        id: "1",
        action: "USER_LOGIN",
        actor: "admin@digibit.com",
        target: "System",
        timestamp: "2024-03-21T10:05:23Z",
        status: "success",
        metadata: "IP: 192.168.1.1",
    },
    {
        id: "2",
        action: "CREATE_POST",
        actor: "editor@digibit.com",
        target: "Blog: Future of Trust",
        timestamp: "2024-03-21T09:45:00Z",
        status: "success",
        metadata: "Post ID: 123",
    },
    {
        id: "3",
        action: "DELETE_USER",
        actor: "admin@digibit.com",
        target: "User: john.doe",
        timestamp: "2024-03-20T16:20:10Z",
        status: "failure",
        metadata: "Permission denied",
    },
    {
        id: "4",
        action: "UPDATE_SETTINGS",
        actor: "system",
        target: "Global Config",
        timestamp: "2024-03-20T00:00:00Z",
        status: "success",
        metadata: "Auto-backup job",
    },
];

export default function AuditLogsPage() {
    const [logs] = React.useState<AuditLog[]>(initialLogs);

    const columns: Column<AuditLog>[] = [
        {
            key: "action",
            header: "Action",
            sortable: true,
            render: (log) => (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium font-mono text-xs">{log.action}</span>
                </div>
            ),
        },
        {
            key: "actor",
            header: "Actor",
            sortable: true,
            render: (log) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-700 dark:text-zinc-300">{log.actor}</span>
                </div>
            ),
        },
        {
            key: "target",
            header: "Target",
            render: (log) => (
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">{log.target}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (log) => (
                <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${log.status === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                >
                    {log.status.toUpperCase()}
                </span>
            ),
        },
        {
            key: "timestamp",
            header: "Timestamp",
            sortable: true,
            render: (log) => (
                <span className="text-sm text-zinc-500 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                </span>
            ),
        },
    ];

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Audit Logs"
                description="View system activities and security events"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "System", href: "/system" },
                    { label: "Audit Logs" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataTable
                    columns={columns}
                    data={logs}
                    keyField="id"
                    searchPlaceholder="Search logs..."
                    searchFields={["action", "actor", "target"]}
                />
            </div>
        </div>
    );
}
