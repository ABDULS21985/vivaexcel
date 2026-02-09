"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "ktblog-ui/components";
import { Input } from "ktblog-ui/components";
import { Textarea } from "ktblog-ui/components";
import { Label } from "ktblog-ui/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "ktblog-ui/components";
import { useCreateReview, useUpdateReview } from "@/hooks/use-reviews";
import { trackConversion } from "@/lib/conversion-tracking";
import { useTranslations } from "next-intl";
import type { Review } from "@/types/review";
import { StarRating } from "./star-rating";

// =============================================================================
// Types
// =============================================================================

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormState {
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  images: string[];
}

// =============================================================================
// Constants
// =============================================================================

const TOTAL_STEPS = 4;

// RATING_LABELS and STEP_LABELS are now derived from translations inside the component

const MAX_IMAGES = 5;
const TITLE_MAX = 200;
const BODY_MIN = 20;
const BODY_MAX = 2000;

// =============================================================================
// Animation Variants
// =============================================================================

const chipVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.3,
  ease: "easeInOut" as const,
};

const successCheckVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
};

// =============================================================================
// Helpers
// =============================================================================

function getDraftKey(productId: string): string {
  return `review-draft-${productId}`;
}

function saveDraft(productId: string, state: FormState): void {
  try {
    localStorage.setItem(getDraftKey(productId), JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function loadDraft(productId: string): FormState | null {
  try {
    const raw = localStorage.getItem(getDraftKey(productId));
    if (!raw) return null;
    return JSON.parse(raw) as FormState;
  } catch {
    return null;
  }
}

function clearDraft(productId: string): void {
  try {
    localStorage.removeItem(getDraftKey(productId));
  } catch {
    // Silently fail
  }
}

// =============================================================================
// Sub-components
// =============================================================================

/** Progress indicator with dots, connecting lines, and step labels */
function StepProgress({
  currentStep,
  completedSteps,
  stepLabels,
  stepAriaLabel,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  stepLabels: string[];
  stepAriaLabel: string;
}) {
  return (
    <div
      className="flex items-center justify-center w-full px-4 mb-6"
      role="navigation"
      aria-label={stepAriaLabel}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = completedSteps.has(stepNum);

        return (
          <div key={stepNum} className="flex items-center">
            {/* Step dot */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold
                  transition-colors duration-300
                  ${
                    isCompleted
                      ? "bg-[#1E4DB7] text-white"
                      : isActive
                        ? "bg-[#1E4DB7] text-white ring-4 ring-[#1E4DB7]/20"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  }
                `}
                layout
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stepNum
                )}
              </motion.div>
              <span
                className={`
                  mt-1.5 text-[10px] font-medium whitespace-nowrap
                  ${
                    isActive || isCompleted
                      ? "text-[#1E4DB7] dark:text-blue-400"
                      : "text-neutral-400 dark:text-neutral-500"
                  }
                `}
              >
                {stepLabels[i]}
              </span>
            </div>

            {/* Connecting line */}
            {i < TOTAL_STEPS - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-0.5 mx-1 rounded-full transition-colors duration-300 -mt-4
                  ${
                    completedSteps.has(stepNum)
                      ? "bg-[#1E4DB7]"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ReviewForm({
  productId,
  existingReview,
  open,
  onOpenChange,
  onSuccess,
}: ReviewFormProps) {
  const t = useTranslations("reviews");
  const isEditing = !!existingReview;

  // ---------------------------------------------------------------------------
  // Form State
  // ---------------------------------------------------------------------------

  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");

  // ---------------------------------------------------------------------------
  // Wizard State
  // ---------------------------------------------------------------------------

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const proInputRef = useRef<HTMLInputElement>(null);
  const conInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Translation-based labels
  const RATING_LABELS: Record<number, string> = {
    1: t("rating.labels.1"),
    2: t("rating.labels.2"),
    3: t("rating.labels.3"),
    4: t("rating.labels.4"),
    5: t("rating.labels.5"),
  };
  const STEP_LABELS = [
    t("form.steps.rating"),
    t("form.steps.details"),
    t("form.steps.prosAndCons"),
    t("form.steps.images"),
  ];

  // ---------------------------------------------------------------------------
  // Initialize form from existing review or localStorage draft
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    // Reset wizard state on open
    setCurrentStep(1);
    setDirection(0);
    setCompletedSteps(new Set());
    setShowSuccess(false);
    setStepErrors({});
    setProInput("");
    setConInput("");

    if (existingReview) {
      // Edit mode: populate from existing review
      setRating(existingReview.rating);
      setTitle(existingReview.title);
      setBody(existingReview.body);
      setPros(existingReview.pros ?? []);
      setCons(existingReview.cons ?? []);
      setImages(existingReview.images ?? []);
    } else {
      // Create mode: try to restore from draft
      const draft = loadDraft(productId);
      if (draft) {
        setRating(draft.rating);
        setTitle(draft.title);
        setBody(draft.body);
        setPros(draft.pros);
        setCons(draft.cons);
        setImages(draft.images);
      } else {
        setRating(0);
        setTitle("");
        setBody("");
        setPros([]);
        setCons([]);
        setImages([]);
      }
    }
  }, [open, existingReview, productId]);

  // ---------------------------------------------------------------------------
  // Auto-save draft (only for new reviews, not edits)
  // ---------------------------------------------------------------------------

  const formState = useMemo<FormState>(
    () => ({ rating, title, body, pros, cons, images }),
    [rating, title, body, pros, cons, images],
  );

  useEffect(() => {
    if (!open || isEditing || showSuccess) return;
    saveDraft(productId, formState);
  }, [formState, open, isEditing, productId, showSuccess]);

  // ---------------------------------------------------------------------------
  // Step Validation
  // ---------------------------------------------------------------------------

  const validateStep = useCallback(
    (step: number): boolean => {
      const errors: Record<string, string> = {};

      if (step === 1) {
        if (rating === 0) {
          errors.rating = t("rating.rateProduct");
        }
      }

      if (step === 2) {
        if (!title.trim()) {
          errors.title = t("form.titleLabel");
        } else if (title.trim().length > TITLE_MAX) {
          errors.title = t("form.titleMax", { count: title.trim().length, max: TITLE_MAX });
        }
        if (!body.trim()) {
          errors.body = t("form.bodyLabel");
        } else if (body.trim().length < BODY_MIN) {
          errors.body = t("form.bodyMin", { min: BODY_MIN });
        } else if (body.trim().length > BODY_MAX) {
          errors.body = t("form.bodyCount", { count: body.trim().length, max: BODY_MAX });
        }
      }

      setStepErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [rating, title, body],
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > TOTAL_STEPS) return;
      setDirection(targetStep > currentStep ? 1 : -1);
      setCurrentStep(targetStep);
      setStepErrors({});
    },
    [currentStep],
  );

  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    goToStep(currentStep + 1);
  }, [currentStep, validateStep, goToStep]);

  const handleBack = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleSkip = useCallback(() => {
    // Mark current step as completed (optional steps)
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  // ---------------------------------------------------------------------------
  // Pros / Cons
  // ---------------------------------------------------------------------------

  const addPro = useCallback(() => {
    const trimmed = proInput.trim();
    if (trimmed && !pros.includes(trimmed)) {
      setPros((prev) => [...prev, trimmed]);
      setProInput("");
      proInputRef.current?.focus();
    }
  }, [proInput, pros]);

  const removePro = useCallback((index: number) => {
    setPros((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addCon = useCallback(() => {
    const trimmed = conInput.trim();
    if (trimmed && !cons.includes(trimmed)) {
      setCons((prev) => [...prev, trimmed]);
      setConInput("");
      conInputRef.current?.focus();
    }
  }, [conInput, cons]);

  const removeCon = useCallback((index: number) => {
    setCons((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleProKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addPro();
      }
    },
    [addPro],
  );

  const handleConKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCon();
      }
    },
    [addCon],
  );

  // ---------------------------------------------------------------------------
  // Images
  // ---------------------------------------------------------------------------

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length;
      const toProcess = fileArray.slice(0, remaining);

      toProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setImages((prev) => {
              if (prev.length >= MAX_IMAGES) return prev;
              return [...prev, result];
            });
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images.length],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      processFiles(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    try {
      if (isEditing && existingReview) {
        await updateMutation.mutateAsync({
          reviewId: existingReview.id,
          rating,
          title: title.trim(),
          body: body.trim(),
          pros,
          cons,
          images,
        });
      } else {
        await createMutation.mutateAsync({
          digitalProductId: productId,
          rating,
          title: title.trim(),
          body: body.trim(),
          pros,
          cons,
          images,
        });
      }

      // Clear draft on successful submission
      clearDraft(productId);

      // Show success state
      setShowSuccess(true);
      trackConversion("REVIEW_WRITTEN", { digitalProductId: productId });
      setCompletedSteps(new Set([1, 2, 3, 4]));

      // Auto-close after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch {
      // Error is handled by the mutation's error state
    }
  }, [
    isEditing,
    existingReview,
    updateMutation,
    createMutation,
    rating,
    title,
    body,
    pros,
    cons,
    images,
    productId,
    onOpenChange,
    onSuccess,
  ]);

  // ---------------------------------------------------------------------------
  // Render: Success State
  // ---------------------------------------------------------------------------

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div
              variants={successCheckVariants}
              initial="initial"
              animate="animate"
              className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30"
            >
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-semibold text-neutral-900 dark:text-white text-center"
            >
              {t("form.success")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-neutral-500 dark:text-neutral-400 text-center"
            >
              {t("form.successDescription")}
            </motion.p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Step 1 - Rating
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200 text-center">
        {t("rating.rateProduct")}
      </p>

      <StarRating value={rating} onChange={setRating} size="lg" />

      <AnimatePresence mode="wait">
        {rating > 0 && (
          <motion.span
            key={rating}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="text-sm font-semibold text-[#1E4DB7] dark:text-blue-400"
          >
            {RATING_LABELS[rating]}
          </motion.span>
        )}
      </AnimatePresence>

      {stepErrors.rating && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {stepErrors.rating}
        </p>
      )}

      {/* Step 1 Navigation */}
      <div className="flex justify-end w-full pt-4">
        <Button
          type="button"
          onClick={handleNext}
          disabled={rating === 0}
          className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-1"
        >
          {t("form.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Step 2 - Title & Body
  // ---------------------------------------------------------------------------

  const renderStep2 = () => (
    <div className="flex flex-col gap-5 py-4">
      {/* Title */}
      <div>
        <Label
          htmlFor="review-title"
          className="text-neutral-700 dark:text-neutral-300 mb-2 block"
        >
          {t("form.titleLabel")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("form.titlePlaceholder")}
          maxLength={TITLE_MAX}
          aria-invalid={!!stepErrors.title}
          className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
        />
        <div className="flex items-center justify-between mt-1">
          {stepErrors.title ? (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {stepErrors.title}
            </p>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-neutral-400 tabular-nums">
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Body */}
      <div>
        <Label
          htmlFor="review-body"
          className="text-neutral-700 dark:text-neutral-300 mb-2 block"
        >
          {t("form.bodyLabel")} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("form.bodyPlaceholder")}
          rows={5}
          maxLength={BODY_MAX}
          aria-invalid={!!stepErrors.body}
          className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white resize-y"
        />
        <div className="flex items-center justify-between mt-1">
          {stepErrors.body ? (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {stepErrors.body}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-[10px] tabular-nums ${
              body.length > 0 && body.length < BODY_MIN
                ? "text-amber-500"
                : "text-neutral-400"
            }`}
          >
            {body.length}/{BODY_MAX}
          </span>
        </div>
      </div>

      {/* Step 2 Navigation */}
      <div className="flex justify-between w-full pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("form.back")}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-1"
        >
          {t("form.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Step 3 - Pros & Cons
  // ---------------------------------------------------------------------------

  const renderStep3 = () => (
    <div className="flex flex-col gap-5 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pros */}
        <div>
          <Label className="text-green-700 dark:text-green-400 mb-2 block font-semibold">
            {t("form.prosLabel")}
          </Label>
          <div className="flex gap-2">
            <Input
              ref={proInputRef}
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyDown={handleProKeyDown}
              placeholder={t("form.prosPlaceholder")}
              className="flex-1 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addPro}
              disabled={!proInput.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {pros.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <AnimatePresence mode="popLayout">
                {pros.map((pro, i) => (
                  <motion.span
                    key={`pro-${pro}-${i}`}
                    variants={chipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full"
                  >
                    {pro}
                    <button
                      type="button"
                      onClick={() => removePro(i)}
                      className="hover:text-green-900 dark:hover:text-green-200 transition-colors"
                      aria-label={t("form.removePro", { text: pro })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Cons */}
        <div>
          <Label className="text-red-600 dark:text-red-400 mb-2 block font-semibold">
            {t("form.consLabel")}
          </Label>
          <div className="flex gap-2">
            <Input
              ref={conInputRef}
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyDown={handleConKeyDown}
              placeholder={t("form.consPlaceholder")}
              className="flex-1 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCon}
              disabled={!conInput.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {cons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <AnimatePresence mode="popLayout">
                {cons.map((con, i) => (
                  <motion.span
                    key={`con-${con}-${i}`}
                    variants={chipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-full"
                  >
                    {con}
                    <button
                      type="button"
                      onClick={() => removeCon(i)}
                      className="hover:text-red-900 dark:hover:text-red-200 transition-colors"
                      aria-label={t("form.removeCon", { text: con })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 Navigation */}
      <div className="flex items-center justify-between w-full pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("form.back")}
        </Button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
          >
            {t("form.skip")}
          </button>
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white gap-1"
          >
            {t("form.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Step 4 - Images
  // ---------------------------------------------------------------------------

  const renderStep4 = () => (
    <div className="flex flex-col gap-5 py-4">
      <Label className="text-neutral-700 dark:text-neutral-300 block">
        {t("form.imagesLabel")}
      </Label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Drag & drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center gap-3 p-8 rounded-xl
          border-2 border-dashed transition-colors duration-200 cursor-pointer
          ${
            isDragging
              ? "border-[#1E4DB7] bg-blue-50/50 dark:bg-blue-900/10"
              : images.length >= MAX_IMAGES
                ? "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 cursor-not-allowed"
                : "border-neutral-300 dark:border-neutral-600 hover:border-[#1E4DB7] dark:hover:border-blue-400 bg-neutral-50/50 dark:bg-neutral-800/30"
          }
        `}
      >
        <Upload
          className={`h-8 w-8 ${
            isDragging
              ? "text-[#1E4DB7] dark:text-blue-400"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {images.length >= MAX_IMAGES
              ? t("form.maxImages")
              : t("form.imagesDescription")}
          </p>
          {images.length < MAX_IMAGES && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {t("form.orClickToBrowse")}
            </p>
          )}
        </div>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 group"
            >
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t("form.removeImage")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mutation Errors */}
      {(createMutation.isError || updateMutation.isError) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">
            {(createMutation.error as Error)?.message ||
              (updateMutation.error as Error)?.message ||
              t("form.error")}
          </p>
        </div>
      )}

      {/* Step 4 Navigation */}
      <div className="flex items-center justify-between w-full pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("form.back")}
        </Button>
        <div className="flex items-center gap-3">
          {images.length === 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
            >
              Skip
            </button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                {t("form.submitting")}
              </span>
            ) : isEditing ? (
              t("form.update")
            ) : (
              t("form.submit")
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step Renderer Map
  // ---------------------------------------------------------------------------

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
  };

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">
            {isEditing ? t("form.editTitle") : t("form.title")}
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            {isEditing
              ? t("editReview")
              : t("shareExperience")}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <StepProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          stepLabels={STEP_LABELS}
          stepAriaLabel={t("form.step", { current: currentStep, total: TOTAL_STEPS, name: STEP_LABELS[currentStep - 1] })}
        />

        {/* Step Content with Animated Transitions */}
        <div className="relative overflow-hidden min-h-[280px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {stepRenderers[currentStep]?.()}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewForm;
