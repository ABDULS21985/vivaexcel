"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { Modal, ConfirmModal } from "@/components/modal";
import { ApplicationForm } from "@/components/forms/application-form";
import { useToast } from "@/components/toast";
import { Button } from "@ktblog/ui/components";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Briefcase,
    UserPlus,
    Star,
    Calendar,
    XCircle,
    Eye,
    Download,
    Filter,
} from "lucide-react";
import { JobApplication, ApplicationStatus } from "@/types/entities";

const initialApplications: JobApplication[] = [
    {
        id: "1",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 555 123 4567",
        positionId: "pos-1",
        positionTitle: "Senior Software Engineer",
        department: "Engineering",
        location: "Remote",
        coverLetter: "I am excited to apply for the Senior Software Engineer position at KTBlog. With over 8 years of experience in full-stack development and a passion for building scalable systems, I believe I would be a great fit for your team.\n\nIn my current role at TechCorp, I have led the development of microservices architecture that handles millions of requests daily. I am particularly drawn to KTBlog's mission of transforming digital banking and would love to contribute to your innovative products.",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
        portfolioUrl: "https://sarahjohnson.dev",
        resumeUrl: "/uploads/resumes/sarah-johnson-resume.pdf",
        resumeFilename: "sarah-johnson-resume.pdf",
        resumeSize: 245000,
        status: "new",
        createdAt: "2024-01-28T09:30:00Z",
    },
    {
        id: "2",
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@techmail.com",
        phone: "+1 555 987 6543",
        positionId: "pos-2",
        positionTitle: "Product Manager",
        department: "Product",
        location: "Dubai, UAE",
        coverLetter: "Dear Hiring Team,\n\nI am writing to express my strong interest in the Product Manager position. With 6 years of experience in product management within fintech, I have successfully launched multiple payment products used by millions of users.\n\nI am particularly impressed by KTBlog's TrustMeHub platform and would be thrilled to contribute to its growth.",
        linkedinUrl: "https://linkedin.com/in/michaelchen",
        resumeUrl: "/uploads/resumes/michael-chen-cv.pdf",
        resumeFilename: "michael-chen-cv.pdf",
        resumeSize: 312000,
        status: "reviewed",
        reviewedAt: "2024-01-27T14:00:00Z",
        createdAt: "2024-01-25T11:15:00Z",
    },
    {
        id: "3",
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.r@gmail.com",
        phone: "+44 7700 900123",
        positionId: "pos-3",
        positionTitle: "UX Designer",
        department: "Design",
        location: "London, UK",
        coverLetter: "Hello,\n\nI am a passionate UX designer with expertise in fintech and banking applications. I have designed user experiences for major European banks and have a deep understanding of regulatory requirements in the financial sector.",
        linkedinUrl: "https://linkedin.com/in/emilyrodriguez",
        portfolioUrl: "https://dribbble.com/emilyrodriguez",
        resumeUrl: "/uploads/resumes/emily-rodriguez-portfolio.pdf",
        resumeFilename: "emily-rodriguez-portfolio.pdf",
        resumeSize: 5200000,
        status: "shortlisted",
        reviewedAt: "2024-01-26T10:30:00Z",
        statusChangedAt: "2024-01-27T09:00:00Z",
        createdAt: "2024-01-24T16:45:00Z",
    },
    {
        id: "4",
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@company.org",
        phone: "+974 5555 4321",
        positionId: "pos-1",
        positionTitle: "Senior Software Engineer",
        department: "Engineering",
        location: "Doha, Qatar",
        coverLetter: "I bring 10+ years of experience in backend development with expertise in Go and Python. I have architected high-performance trading systems and am excited about the opportunity to work on KTBlog's innovative platforms.",
        linkedinUrl: "https://linkedin.com/in/davidkim",
        resumeUrl: "/uploads/resumes/david-kim-resume.pdf",
        resumeFilename: "david-kim-resume.pdf",
        resumeSize: 198000,
        status: "interview",
        reviewedAt: "2024-01-23T11:00:00Z",
        statusChangedAt: "2024-01-26T15:30:00Z",
        notes: "Interview scheduled for Feb 1st at 2:00 PM. Technical interview with Engineering team.",
        createdAt: "2024-01-22T08:00:00Z",
    },
    {
        id: "5",
        firstName: "Amanda",
        lastName: "Foster",
        email: "a.foster@email.com",
        positionId: "pos-4",
        positionTitle: "Marketing Manager",
        department: "Marketing",
        location: "Remote",
        coverLetter: "With a background in B2B marketing for technology companies, I am eager to help KTBlog expand its market presence.",
        resumeUrl: "/uploads/resumes/amanda-foster-cv.pdf",
        resumeFilename: "amanda-foster-cv.pdf",
        resumeSize: 275000,
        status: "rejected",
        reviewedAt: "2024-01-20T09:00:00Z",
        statusChangedAt: "2024-01-21T14:00:00Z",
        notes: "Does not meet minimum experience requirements for the role.",
        createdAt: "2024-01-19T13:20:00Z",
    },
    {
        id: "6",
        firstName: "James",
        lastName: "Wilson",
        email: "jwilson@proton.me",
        phone: "+1 555 444 3333",
        positionId: "pos-5",
        positionTitle: "DevOps Engineer",
        department: "Engineering",
        location: "Remote",
        coverLetter: "I specialize in cloud infrastructure and CI/CD pipelines. Currently managing AWS infrastructure for a Fortune 500 company.",
        linkedinUrl: "https://linkedin.com/in/jameswilson",
        resumeUrl: "/uploads/resumes/james-wilson-resume.pdf",
        resumeFilename: "james-wilson-resume.pdf",
        resumeSize: 220000,
        status: "new",
        createdAt: "2024-01-28T14:00:00Z",
    },
];

const statusConfig: Record<ApplicationStatus, { label: string; bgColor: string; textColor: string }> = {
    new: {
        label: "New",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-400",
    },
    reviewed: {
        label: "Reviewed",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        textColor: "text-gray-700 dark:text-gray-300",
    },
    shortlisted: {
        label: "Shortlisted",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        textColor: "text-amber-700 dark:text-amber-400",
    },
    interview: {
        label: "Interview",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        textColor: "text-purple-700 dark:text-purple-400",
    },
    offered: {
        label: "Offered",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        textColor: "text-indigo-700 dark:text-indigo-400",
    },
    hired: {
        label: "Hired",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-400",
    },
    rejected: {
        label: "Rejected",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-400",
    },
    withdrawn: {
        label: "Withdrawn",
        bgColor: "bg-zinc-100 dark:bg-zinc-700",
        textColor: "text-zinc-600 dark:text-zinc-400",
    },
};

const departments = ["All Departments", "Engineering", "Product", "Design", "Marketing", "Sales", "Operations"];

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ApplicationsPage() {
    const { success, error } = useToast();
    const [applications, setApplications] = React.useState<JobApplication[]>(initialApplications);
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedApplication, setSelectedApplication] = React.useState<JobApplication | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = React.useState<string>("All Departments");

    // Filter applications based on status and department
    const filteredApplications = React.useMemo(() => {
        return applications.filter((app) => {
            const statusMatch = statusFilter === "all" || app.status === statusFilter;
            const deptMatch = departmentFilter === "All Departments" || app.department === departmentFilter;
            return statusMatch && deptMatch;
        });
    }, [applications, statusFilter, departmentFilter]);

    const stats = {
        total: applications.length,
        new: applications.filter((a) => a.status === "new").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted").length,
        interview: applications.filter((a) => a.status === "interview").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
    };

    const columns: Column<JobApplication>[] = [
        {
            key: "firstName",
            header: "Applicant",
            sortable: true,
            render: (application) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                        {application.firstName} {application.lastName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {application.email}
                    </p>
                </div>
            ),
        },
        {
            key: "positionTitle",
            header: "Position",
            sortable: true,
            render: (application) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white line-clamp-1">
                        {application.positionTitle}
                    </p>
                    {application.location && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {application.location}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "department",
            header: "Department",
            sortable: true,
            render: (application) => (
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {application.department}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (application) => {
                const config = statusConfig[application.status];
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
            render: (application) => (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(application.createdAt)}
                </span>
            ),
        },
    ];

    const handleView = (application: JobApplication) => {
        setSelectedApplication(application);
        setIsViewOpen(true);

        // Mark as reviewed if new
        if (application.status === "new") {
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === application.id
                        ? { ...a, status: "reviewed" as const, reviewedAt: new Date().toISOString() }
                        : a
                )
            );
        }
    };

    const handleDelete = (application: JobApplication) => {
        setSelectedApplication(application);
        setIsDeleteOpen(true);
    };

    const handleUpdateStatus = async (id: string, status: ApplicationStatus) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === id
                        ? { ...a, status, statusChangedAt: new Date().toISOString() }
                        : a
                )
            );
            // Update selected application if viewing
            if (selectedApplication?.id === id) {
                setSelectedApplication((prev) =>
                    prev ? { ...prev, status, statusChangedAt: new Date().toISOString() } : null
                );
            }
            success("Status updated", "Application status has been updated.");
        } catch {
            error("Error", "Failed to update status.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (id: string, note: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === id
                        ? { ...a, notes: a.notes ? `${a.notes}\n\n${note}` : note }
                        : a
                )
            );
            // Update selected application if viewing
            if (selectedApplication?.id === id) {
                setSelectedApplication((prev) =>
                    prev
                        ? { ...prev, notes: prev.notes ? `${prev.notes}\n\n${note}` : note }
                        : null
                );
            }
            success("Note added", "Internal note has been added.");
        } catch {
            error("Error", "Failed to add note.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedApplication) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setApplications((prev) => prev.filter((a) => a.id !== selectedApplication.id));
            success("Application deleted", "The job application has been deleted.");
            setIsDeleteOpen(false);
            setIsViewOpen(false);
            setSelectedApplication(null);
        } catch {
            error("Error", "Failed to delete application.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Position",
            "Department",
            "Location",
            "Status",
            "Resume",
            "LinkedIn",
            "Portfolio",
            "Applied Date",
        ];
        const rows = filteredApplications.map((a) => [
            a.firstName,
            a.lastName,
            a.email,
            a.phone || "",
            a.positionTitle,
            a.department,
            a.location || "",
            a.status,
            a.resumeFilename,
            a.linkedinUrl || "",
            a.portfolioUrl || "",
            formatDate(a.createdAt),
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `applications_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        success("Export complete", "Applications have been exported to CSV.");
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Job Applications"
                description="Review and manage job applications from candidates"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Applications" },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatsCard
                        title="Total Applications"
                        value={stats.total}
                        icon={<Briefcase className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="New"
                        value={stats.new}
                        icon={<UserPlus className="h-5 w-5" />}
                        variant="primary"
                    />
                    <StatsCard
                        title="Shortlisted"
                        value={stats.shortlisted}
                        icon={<Star className="h-5 w-5" />}
                        variant="warning"
                    />
                    <StatsCard
                        title="Interview"
                        value={stats.interview}
                        icon={<Calendar className="h-5 w-5" />}
                        variant="primary"
                    />
                    <StatsCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={<XCircle className="h-5 w-5" />}
                        variant="danger"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Filters:</span>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.entries(statusConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                    {dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Applications Table */}
                <DataTable<JobApplication>
                    columns={columns}
                    data={filteredApplications}
                    keyField="id"
                    searchPlaceholder="Search applications..."
                    searchFields={["firstName", "lastName", "email", "positionTitle", "department"]}
                    onDelete={handleDelete}
                    actions={(application) => (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(application)}
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="h-4 w-4 text-zinc-500 hover:text-primary" />
                        </Button>
                    )}
                />

                {/* Stats Highlight */}
                <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Recruitment Dashboard</h2>
                    <p className="text-indigo-100 mb-6">
                        Track candidates through your hiring pipeline. Review applications,
                        schedule interviews, and make hiring decisions efficiently.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">3 days</div>
                            <div className="text-sm text-indigo-200">Avg Review Time</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">85%</div>
                            <div className="text-sm text-indigo-200">Review Rate</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">12%</div>
                            <div className="text-sm text-indigo-200">Hire Rate</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl font-bold">24</div>
                            <div className="text-sm text-indigo-200">This Month</div>
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
                            Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">GET /api/v1/applications</code> to fetch applications
                        </li>
                        <li>
                            Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">PATCH /api/v1/applications/:id</code> to update status
                        </li>
                    </ul>
                </div>
            </div>

            {/* View Application Modal */}
            <Modal
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                title="Application Details"
                size="lg"
            >
                {selectedApplication && (
                    <ApplicationForm
                        application={selectedApplication}
                        onUpdateStatus={handleUpdateStatus}
                        onAddNote={handleAddNote}
                        onDelete={async () => {
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
                title="Delete Application"
                description={`Are you sure you want to delete the application from ${selectedApplication?.firstName} ${selectedApplication?.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
