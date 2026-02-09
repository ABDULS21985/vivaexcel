"use client";

import * as React from "react";
import {
    Button,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from "@digibit/ui/components";
import {
    Loader2,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    User,
    FileText,
    Download,
    ExternalLink,
    Trash2,
    MapPin,
    Linkedin,
    Globe,
} from "lucide-react";
import { JobApplication, ApplicationStatus } from "@/types/entities";

interface ApplicationFormProps {
    application: JobApplication;
    onUpdateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
    onAddNote: (id: string, note: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    onClose?: () => void;
    isLoading?: boolean;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
    { value: "new", label: "New", color: "bg-blue-500" },
    { value: "reviewed", label: "Reviewed", color: "bg-gray-500" },
    { value: "shortlisted", label: "Shortlisted", color: "bg-amber-500" },
    { value: "interview", label: "Interview", color: "bg-purple-500" },
    { value: "offered", label: "Offered", color: "bg-indigo-500" },
    { value: "hired", label: "Hired", color: "bg-green-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
    { value: "withdrawn", label: "Withdrawn", color: "bg-zinc-500" },
];

const statusBadgeColors: Record<ApplicationStatus, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    reviewed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    shortlisted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    interview: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    offered: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    hired: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    withdrawn: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function ApplicationForm({
    application,
    onUpdateStatus,
    onAddNote,
    onDelete,
    onClose,
    isLoading = false,
}: ApplicationFormProps) {
    const [note, setNote] = React.useState("");
    const [currentStatus, setCurrentStatus] = React.useState(application.status);
    const [activeTab, setActiveTab] = React.useState<"details" | "notes">("details");

    // Update local status when application changes
    React.useEffect(() => {
        setCurrentStatus(application.status);
    }, [application.status]);

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        setCurrentStatus(newStatus);
        await onUpdateStatus(application.id, newStatus);
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        await onAddNote(application.id, note);
        setNote("");
    };

    const fullName = `${application.firstName} ${application.lastName}`;

    return (
        <div className="flex flex-col h-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {fullName}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Applied on {formatDate(application.createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            statusBadgeColors[currentStatus]
                        )}
                    >
                        {statusOptions.find((s) => s.value === currentStatus)?.label}
                    </span>
                </div>
            </div>

            {/* Applicant Details */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Applicant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {fullName}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Full Name
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <a
                                href={`mailto:${application.email}`}
                                className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary flex items-center gap-1"
                            >
                                {application.email}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Email</p>
                        </div>
                    </div>

                    {application.phone && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <a
                                    href={`tel:${application.phone}`}
                                    className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary flex items-center gap-1"
                                >
                                    {application.phone}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Phone</p>
                            </div>
                        </div>
                    )}

                    {application.location && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {application.location}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Location
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Position Info */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Position Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {application.positionTitle}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Position
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {application.department}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Department
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Links & Documents
                </h3>
                <div className="flex flex-wrap gap-3">
                    {/* Resume Download */}
                    <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {application.resumeFilename}
                        </span>
                        <span className="text-xs text-primary/70">
                            ({formatFileSize(application.resumeSize)})
                        </span>
                    </a>

                    {/* LinkedIn */}
                    {application.linkedinUrl && (
                        <a
                            href={application.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <Linkedin className="h-4 w-4" />
                            <span className="text-sm font-medium">LinkedIn Profile</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}

                    {/* Portfolio */}
                    {application.portfolioUrl && (
                        <a
                            href={application.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            <Globe className="h-4 w-4" />
                            <span className="text-sm font-medium">Portfolio</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>

            {/* Status Update */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Update Status
                    </span>
                    <Select
                        value={currentStatus}
                        onValueChange={handleStatusChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                option.color
                                            )}
                                        />
                                        {option.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {application.statusChangedAt && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        Last status change: {formatDate(application.statusChangedAt)}
                    </p>
                )}
            </div>

            {/* Tabs: Details / Notes */}
            <div className="flex-1 pt-4">
                <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-700 mb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className={cn(
                            "pb-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === "details"
                                ? "border-primary text-primary"
                                : "border-transparent text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Cover Letter
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("notes")}
                        className={cn(
                            "pb-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === "notes"
                                ? "border-primary text-primary"
                                : "border-transparent text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Internal Notes
                    </button>
                </div>

                {activeTab === "details" ? (
                    <div className="space-y-4">
                        {application.coverLetter ? (
                            <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                    {application.coverLetter}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4 text-center">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                    No cover letter provided
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {application.notes && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
                                    {application.notes}
                                </p>
                            </div>
                        )}
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add internal notes about this applicant..."
                            rows={4}
                            disabled={isLoading}
                        />
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={handleAddNote}
                                disabled={isLoading || !note.trim()}
                            >
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Add Note
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-2">
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(application.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
                {onClose && (
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Close
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ApplicationForm;
