"use client";

import * as React from "react";
import {
    Input,
    Button,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from "@ktblog/ui/components";
import {
    Loader2,
    Mail,
    Phone,
    Building,
    Calendar,
    User,
    MessageSquare,
    Send,
    Archive,
    Trash2,
    ExternalLink,
} from "lucide-react";

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    status: "new" | "read" | "in_progress" | "replied" | "closed" | "spam";
    createdAt: string;
    notes?: string;
    assignedTo?: string;
}

interface ContactFormProps {
    submission: ContactSubmission;
    onUpdateStatus: (id: string, status: ContactSubmission["status"]) => Promise<void>;
    onSendReply: (id: string, replyMessage: string) => Promise<void>;
    onAddNote: (id: string, note: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    onClose?: () => void;
    isLoading?: boolean;
}

const statusOptions: { value: ContactSubmission["status"]; label: string; color: string }[] = [
    { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
    { value: "read", label: "Read", color: "bg-gray-100 text-gray-700" },
    { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
    { value: "replied", label: "Replied", color: "bg-green-100 text-green-700" },
    { value: "closed", label: "Closed", color: "bg-purple-100 text-purple-700" },
    { value: "spam", label: "Spam", color: "bg-red-100 text-red-700" },
];

export function ContactForm({
    submission,
    onUpdateStatus,
    onSendReply,
    onAddNote,
    onDelete,
    onClose,
    isLoading = false,
}: ContactFormProps) {
    const [replyMessage, setReplyMessage] = React.useState("");
    const [note, setNote] = React.useState("");
    const [currentStatus, setCurrentStatus] = React.useState(submission.status);
    const [activeTab, setActiveTab] = React.useState<"reply" | "notes">("reply");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleStatusChange = async (newStatus: ContactSubmission["status"]) => {
        setCurrentStatus(newStatus);
        await onUpdateStatus(submission.id, newStatus);
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;
        await onSendReply(submission.id, replyMessage);
        setReplyMessage("");
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        await onAddNote(submission.id, note);
        setNote("");
    };

    const currentStatusConfig = statusOptions.find((s) => s.value === currentStatus);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {submission.subject}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Submitted on {formatDate(submission.createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            currentStatusConfig?.color
                        )}
                    >
                        {currentStatusConfig?.label}
                    </span>
                </div>
            </div>

            {/* Contact Details */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {submission.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Contact Name
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <a
                                href={`mailto:${submission.email}`}
                                className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary flex items-center gap-1"
                            >
                                {submission.email}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Email</p>
                        </div>
                    </div>

                    {submission.phone && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <a
                                    href={`tel:${submission.phone}`}
                                    className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary flex items-center gap-1"
                                >
                                    {submission.phone}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Phone</p>
                            </div>
                        </div>
                    )}

                    {submission.company && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {submission.company}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Company
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message */}
            <div className="py-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Message
                    </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {submission.message}
                    </p>
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
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                option.color.replace("text-", "bg-").split(" ")[0]
                                            )}
                                        />
                                        {option.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reply / Notes Tabs */}
            <div className="flex-1 pt-4">
                <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-700 mb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("reply")}
                        className={cn(
                            "pb-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === "reply"
                                ? "border-primary text-primary"
                                : "border-transparent text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Send Reply
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

                {activeTab === "reply" ? (
                    <div className="space-y-4">
                        <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply message..."
                            rows={6}
                            disabled={isLoading}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Reply will be sent to {submission.email}
                            </p>
                            <Button
                                onClick={handleSendReply}
                                disabled={isLoading || !replyMessage.trim()}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Send Reply
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {submission.notes && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    {submission.notes}
                                </p>
                            </div>
                        )}
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add internal notes about this contact..."
                            rows={4}
                            disabled={isLoading}
                        />
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={handleAddNote}
                                disabled={isLoading || !note.trim()}
                            >
                                Add Note
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange("closed")}
                        disabled={isLoading}
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                    </Button>
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(submission.id)}
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

export default ContactForm;
