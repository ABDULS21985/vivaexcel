"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    Phone,
    FileText,
    Linkedin,
    Globe,
    Upload,
    X,
    File,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import type { JobPosition } from "@/data/careers";

// ============================================================================
// Types
// ============================================================================

interface ApplicationFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resume: FileList | null;
    coverLetter?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface JobApplicationFormProps {
    position: JobPosition;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_FILE_EXTENSIONS = ".pdf,.doc,.docx";

// ============================================================================
// File Drop Zone Component
// ============================================================================

interface FileDropZoneProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    error?: string;
    disabled?: boolean;
    t: ReturnType<typeof useTranslations<"careers.apply">>;
}

function FileDropZone({ file, onFileSelect, error, disabled, t }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    }, [disabled, onFileSelect]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const handleRemoveFile = useCallback(() => {
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }, [onFileSelect]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
                {t("resumeLabel")} <span className="text-red-500">*</span>
            </label>

            {file ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                            {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {formatFileSize(file.size)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                        disabled={disabled}
                        aria-label="Remove file"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </motion.div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? "border-primary bg-primary/5"
                            : error
                                ? "border-red-300 bg-red-50"
                                : "border-neutral-200 hover:border-primary/50 hover:bg-neutral-50"
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_FILE_EXTENSIONS}
                        onChange={handleFileChange}
                        className="sr-only"
                        disabled={disabled}
                        aria-label={t("resumeLabel")}
                    />

                    <div className="flex flex-col items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${isDragging ? "bg-primary/10" : "bg-neutral-100"}
                        `}>
                            <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-neutral-400"}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-900">
                                {t("dragDropResume")}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                {t("resumeFormats")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.p>
            )}
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function JobApplicationForm({ position }: JobApplicationFormProps) {
    const t = useTranslations("careers.apply");
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
    const [submitMessage, setSubmitMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | undefined>();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ApplicationFormData>({
        mode: "onBlur",
    });

    const validateFile = useCallback((file: File | null): string | undefined => {
        if (!file) {
            return t("validation.resumeRequired");
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            return t("validation.invalidFileType");
        }
        if (file.size > MAX_FILE_SIZE) {
            return t("validation.fileTooLarge");
        }
        return undefined;
    }, [t]);

    const handleFileSelect = useCallback((file: File | null) => {
        setSelectedFile(file);
        if (file) {
            const error = validateFile(file);
            setFileError(error);
        } else {
            setFileError(undefined);
        }
    }, [validateFile]);

    const onSubmit = async (data: ApplicationFormData) => {
        // Validate file
        const fileValidationError = validateFile(selectedFile);
        if (fileValidationError) {
            setFileError(fileValidationError);
            return;
        }

        setSubmitStatus("loading");
        setSubmitMessage("");

        try {
            const formData = new FormData();
            formData.append("firstName", data.firstName.trim());
            formData.append("lastName", data.lastName.trim());
            formData.append("email", data.email.trim());
            formData.append("position", position.title);
            formData.append("positionSlug", position.slug);
            formData.append("department", position.department);

            if (data.phone) {
                formData.append("phone", data.phone.trim());
            }
            if (selectedFile) {
                formData.append("resume", selectedFile);
            }
            if (data.coverLetter) {
                formData.append("coverLetter", data.coverLetter.trim());
            }
            if (data.linkedinUrl) {
                formData.append("linkedinUrl", data.linkedinUrl.trim());
            }
            if (data.portfolioUrl) {
                formData.append("portfolioUrl", data.portfolioUrl.trim());
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.drkatangablog.com/api/v1";
            const response = await fetch(`${apiUrl}/careers/apply`, {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                setSubmitStatus("success");
                setSubmitMessage(t("successMessage"));
                reset();
                setSelectedFile(null);
            } else if (response.status === 429) {
                setSubmitStatus("error");
                setSubmitMessage(t("rateLimitError"));
            } else {
                setSubmitStatus("error");
                setSubmitMessage(responseData.message || t("errorMessage"));
            }
        } catch {
            setSubmitStatus("error");
            setSubmitMessage(t("networkError"));
        }
    };

    const resetForm = () => {
        reset();
        setSelectedFile(null);
        setFileError(undefined);
        setSubmitStatus("idle");
        setSubmitMessage("");
    };

    // Success state
    if (submitStatus === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg"
            >
                <div className="text-center py-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        {t("successTitle")}
                    </h3>
                    <p className="text-neutral-600 mb-6">
                        {submitMessage}
                    </p>
                    <Button
                        onClick={resetForm}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                        {t("applyAgain")}
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {t("title")}
                </h3>
                <p className="text-sm text-neutral-500">
                    {t("subtitle")}
                </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
                {submitStatus === "error" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div
                            role="alert"
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                        >
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                            <p className="text-red-800 text-sm">{submitMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            {t("firstNameLabel")} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                id="firstName"
                                type="text"
                                {...register("firstName", {
                                    required: t("validation.firstNameRequired"),
                                    minLength: { value: 2, message: t("validation.firstNameMinLength") },
                                })}
                                disabled={submitStatus === "loading"}
                                className={`
                                    w-full pl-10 pr-4 py-2.5 border rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                    ${errors.firstName ? "border-red-300" : "border-neutral-200"}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                placeholder={t("firstNamePlaceholder")}
                            />
                        </div>
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            {t("lastNameLabel")} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                id="lastName"
                                type="text"
                                {...register("lastName", {
                                    required: t("validation.lastNameRequired"),
                                    minLength: { value: 2, message: t("validation.lastNameMinLength") },
                                })}
                                disabled={submitStatus === "loading"}
                                className={`
                                    w-full pl-10 pr-4 py-2.5 border rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                    ${errors.lastName ? "border-red-300" : "border-neutral-200"}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                placeholder={t("lastNamePlaceholder")}
                            />
                        </div>
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {t("emailLabel")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: t("validation.emailRequired"),
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: t("validation.emailInvalid"),
                                },
                            })}
                            disabled={submitStatus === "loading"}
                            className={`
                                w-full pl-10 pr-4 py-2.5 border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                ${errors.email ? "border-red-300" : "border-neutral-200"}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            placeholder={t("emailPlaceholder")}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {t("phoneLabel")}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            id="phone"
                            type="tel"
                            {...register("phone")}
                            disabled={submitStatus === "loading"}
                            className={`
                                w-full pl-10 pr-4 py-2.5 border rounded-lg border-neutral-200
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            placeholder={t("phonePlaceholder")}
                        />
                    </div>
                </div>

                {/* Resume upload */}
                <FileDropZone
                    file={selectedFile}
                    onFileSelect={handleFileSelect}
                    error={fileError}
                    disabled={submitStatus === "loading"}
                    t={t}
                />

                {/* Cover Letter */}
                <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {t("coverLetterLabel")}
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                        <textarea
                            id="coverLetter"
                            {...register("coverLetter")}
                            disabled={submitStatus === "loading"}
                            rows={4}
                            className={`
                                w-full pl-10 pr-4 py-2.5 border rounded-lg border-neutral-200 resize-none
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            placeholder={t("coverLetterPlaceholder")}
                        />
                    </div>
                </div>

                {/* LinkedIn URL */}
                <div>
                    <label htmlFor="linkedinUrl" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {t("linkedinLabel")}
                    </label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            id="linkedinUrl"
                            type="url"
                            {...register("linkedinUrl", {
                                pattern: {
                                    value: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
                                    message: t("validation.linkedinInvalid"),
                                },
                            })}
                            disabled={submitStatus === "loading"}
                            className={`
                                w-full pl-10 pr-4 py-2.5 border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                ${errors.linkedinUrl ? "border-red-300" : "border-neutral-200"}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            placeholder={t("linkedinPlaceholder")}
                        />
                    </div>
                    {errors.linkedinUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.linkedinUrl.message}</p>
                    )}
                </div>

                {/* Portfolio URL */}
                <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {t("portfolioLabel")}
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            id="portfolioUrl"
                            type="url"
                            {...register("portfolioUrl", {
                                pattern: {
                                    value: /^https?:\/\/.+/i,
                                    message: t("validation.portfolioInvalid"),
                                },
                            })}
                            disabled={submitStatus === "loading"}
                            className={`
                                w-full pl-10 pr-4 py-2.5 border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                ${errors.portfolioUrl ? "border-red-300" : "border-neutral-200"}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            placeholder={t("portfolioPlaceholder")}
                        />
                    </div>
                    {errors.portfolioUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl.message}</p>
                    )}
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={submitStatus === "loading"}
                    className={`
                        w-full bg-gradient-to-r from-primary to-secondary
                        hover:from-primary/90 hover:to-secondary/90
                        text-white px-6 py-3 rounded-xl font-semibold
                        transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                        hover:shadow-lg hover:shadow-primary/30
                    `}
                >
                    {submitStatus === "loading" ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t("submitting")}</span>
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            <span>{t("submitButton")}</span>
                        </>
                    )}
                </Button>

                {/* Privacy note */}
                <p className="text-xs text-center text-neutral-400">
                    {t("privacyNote")}{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                        {t("privacyLink")}
                    </a>
                </p>
            </form>
        </div>
    );
}
