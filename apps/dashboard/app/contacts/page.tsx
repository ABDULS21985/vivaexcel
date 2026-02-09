"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { Modal, ConfirmModal } from "@/components/modal";
import { ContactForm, ContactSubmission } from "@/components/forms/contact-form";
import { useToast } from "@/components/toast";
import { Button } from "@ktblog/ui/components";
import { Mail, MessageSquare, Clock, CheckCircle, Eye, Download } from "lucide-react";

const initialSubmissions: ContactSubmission[] = [
    {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 234 567 890",
        company: "Acme Inc.",
        subject: "Partnership Inquiry",
        message: "We are interested in exploring potential partnership opportunities with KTBlog for our digital transformation initiatives.",
        status: "new",
        createdAt: "2024-01-26T10:30:00Z",
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@techcorp.com",
        phone: "+44 789 123 456",
        company: "TechCorp Ltd",
        subject: "Product Demo Request",
        message: "I would like to schedule a demo of TrustMeHub for our compliance team. We are looking for a solution to verify credentials across our 15 branch offices.",
        status: "in_progress",
        createdAt: "2024-01-25T14:15:00Z",
    },
    {
        id: "3",
        name: "Micha Abdul",
        email: "mabdul@drkatangablog.com",
        phone: "+974 5555 1234",
        company: "Government Bank Qatar",
        subject: "CBDC Implementation",
        message: "Our bank is exploring CBDC solutions and we heard about your expertise in this area. Can we arrange a meeting to discuss potential collaboration?",
        status: "replied",
        createdAt: "2024-01-24T09:00:00Z",
    },
    {
        id: "4",
        name: "Maria Garcia",
        email: "maria@startup.io",
        phone: "",
        company: "StartupIO",
        subject: "API Integration Help",
        message: "We need help integrating your DigiGate API with our existing infrastructure. Do you provide technical support services?",
        status: "read",
        createdAt: "2024-01-23T16:45:00Z",
    },
    {
        id: "5",
        name: "Test User",
        email: "spam@test.com",
        phone: "",
        company: "",
        subject: "FREE MONEY!!!",
        message: "Click here for free money...",
        status: "spam",
        createdAt: "2024-01-22T08:00:00Z",
    },
];

const statusConfig: Record<ContactSubmission["status"], { label: string; bgColor: string; textColor: string }> = {
    new: {
        label: "New",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-400",
    },
    read: {
        label: "Read",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        textColor: "text-gray-700 dark:text-gray-300",
    },
    in_progress: {
        label: "In Progress",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-700 dark:text-yellow-400",
    },
    replied: {
        label: "Replied",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-400",
    },
    closed: {
        label: "Closed",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        textColor: "text-purple-700 dark:text-purple-400",
    },
    spam: {
        label: "Spam",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-400",
    },
};

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function ContactsPage() {
    const { success, error } = useToast();
    const [submissions, setSubmissions] = React.useState<ContactSubmission[]>(initialSubmissions);
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedSubmission, setSelectedSubmission] = React.useState<ContactSubmission | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const stats = {
        total: submissions.length,
        new: submissions.filter((s) => s.status === "new").length,
        pending: submissions.filter((s) => ["new", "read", "in_progress"].includes(s.status)).length,
        replied: submissions.filter((s) => s.status === "replied").length,
    };

    const columns: Column<ContactSubmission>[] = [
        {
            key: "name",
            header: "Contact",
            sortable: true,
            render: (submission) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                        {submission.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {submission.email}
                    </p>
                    {submission.company && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {submission.company}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "subject",
            header: "Subject",
            sortable: true,
            render: (submission) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white line-clamp-1">
                        {submission.subject}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {submission.message}
                    </p>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (submission) => {
                const config = statusConfig[submission.status];
                return (
                    <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}
                    >
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: "createdAt",
            header: "Date",
            sortable: true,
            render: (submission) => (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(submission.createdAt)}
                </span>
            ),
        },
    ];

    const handleView = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsViewOpen(true);

        // Mark as read if new
        if (submission.status === "new") {
            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === submission.id ? { ...s, status: "read" as const } : s
                )
            );
        }
    };

    const handleDelete = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsDeleteOpen(true);
    };

    const handleUpdateStatus = async (id: string, status: ContactSubmission["status"]) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status } : s))
            );
            success("Status updated", "Contact status has been updated.");
        } catch {
            error("Error", "Failed to update status.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendReply = async (id: string, message: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSubmissions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: "replied" as const } : s))
            );
            success("Reply sent", "Your reply has been sent successfully.");
        } catch {
            error("Error", "Failed to send reply.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (id: string, note: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? { ...s, notes: s.notes ? `${s.notes}\n${note}` : note }
                        : s
                )
            );
            success("Note added", "Internal note has been added.");
        } catch {
            error("Error", "Failed to add note.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubmission) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSubmissions((prev) => prev.filter((s) => s.id !== selectedSubmission.id));
            success("Contact deleted", "The contact submission has been deleted.");
            setIsDeleteOpen(false);
            setIsViewOpen(false);
            setSelectedSubmission(null);
        } catch {
            error("Error", "Failed to delete contact.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Phone", "Company", "Subject", "Message", "Status", "Date"];
        const rows = submissions.map((s) => [
            s.name,
            s.email,
            s.phone || "",
            s.company || "",
            s.subject,
            s.message.replace(/"/g, '""'),
            s.status,
            formatDate(s.createdAt),
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `contacts_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        success("Export complete", "Contacts have been exported to CSV.");
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Contact Submissions"
                description="Manage and respond to contact form inquiries"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Contacts" },
                ]}
                actions={
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Submissions"
                        value={stats.total}
                        icon={<Mail className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="New Messages"
                        value={stats.new}
                        icon={<MessageSquare className="h-5 w-5" />}
                        variant="primary"
                    />
                    <StatsCard
                        title="Pending Response"
                        value={stats.pending}
                        icon={<Clock className="h-5 w-5" />}
                        variant="warning"
                    />
                    <StatsCard
                        title="Replied"
                        value={stats.replied}
                        icon={<CheckCircle className="h-5 w-5" />}
                        variant="success"
                    />
                </div>

                {/* Contacts Table */}
                <DataTable<ContactSubmission>
                    columns={columns}
                    data={submissions}
                    keyField="id"
                    searchPlaceholder="Search contacts..."
                    searchFields={["name", "email", "subject", "company"]}
                    onDelete={handleDelete}
                    actions={(submission) => (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(submission)}
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="h-4 w-4 text-zinc-500 hover:text-primary" />
                        </Button>
                    )}
                />

                {/* Stats Highlight */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Contact Management Dashboard</h2>
                    <p className="text-blue-100 mb-6">
                        Monitor and respond to inquiries from potential clients and partners.
                        Keep track of response times and maintain excellent customer service.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">&lt;24h</div>
                            <div className="text-sm text-blue-200">Avg Response Time</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">95%</div>
                            <div className="text-sm text-blue-200">Response Rate</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">4.8/5</div>
                            <div className="text-sm text-blue-200">Satisfaction Score</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-sm text-blue-200">This Week</div>
                        </div>
                    </div>
                </div>

                {/* API Integration Note */}
                <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">
                        API Integration Required
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                        This page displays sample data. To connect to the live backend API:
                    </p>
                    <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                        <li>
                            Configure <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">NEXT_PUBLIC_API_URL</code> environment variable
                        </li>
                        <li>
                            Implement authentication to access admin endpoints
                        </li>
                        <li>
                            Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">GET /api/v1/contact</code> to fetch submissions
                        </li>
                        <li>
                            Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">GET /api/v1/contact/stats</code> for statistics
                        </li>
                    </ul>
                </div>
            </div>

            {/* View Contact Modal */}
            <Modal
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                title="Contact Details"
                size="lg"
            >
                {selectedSubmission && (
                    <ContactForm
                        submission={selectedSubmission}
                        onUpdateStatus={handleUpdateStatus}
                        onSendReply={handleSendReply}
                        onAddNote={handleAddNote}
                        onDelete={async (id) => {
                            setIsViewOpen(false);
                            setIsDeleteOpen(true);
                        }}
                        onClose={() => setIsViewOpen(false)}
                        isLoading={isLoading}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Contact"
                description={`Are you sure you want to delete this contact from ${selectedSubmission?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
