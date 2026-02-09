"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Upload,
  Image as ImageIcon,
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
import type { Review } from "@/types/review";
import { StarRating } from "./star-rating";

// =============================================================================
// Types
// =============================================================================

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  rating?: string;
  title?: string;
  body?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const chipVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// =============================================================================
// Component
// =============================================================================

export function ReviewForm({
  productId,
  existingReview,
  onSuccess,
  open,
  onOpenChange,
}: ReviewFormProps) {
  const isEditing = !!existingReview;

  // Form state
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [pros, setPros] = useState<string[]>(existingReview?.pros ?? []);
  const [cons, setCons] = useState<string[]>(existingReview?.cons ?? []);
  const [images, setImages] = useState<string[]>(existingReview?.images ?? []);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const proInputRef = useRef<HTMLInputElement>(null);
  const conInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }
    if (!body.trim()) {
      newErrors.body = "Review body is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rating, title, body]);

  // -------------------------------------------------------------------------
  // Pros / Cons
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Images
  // -------------------------------------------------------------------------

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      // Convert to data URLs for preview (in production, would upload to server)
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

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

        onOpenChange(false);
        onSuccess?.();
      } catch {
        // Error is handled by the mutation's error state
      }
    },
    [
      validate,
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
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            {isEditing
              ? "Update your review below."
              : "Share your experience with this product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Rating */}
          <div>
            <Label className="text-neutral-700 dark:text-neutral-300 mb-2 block">
              Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {errors.rating && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label
              htmlFor="review-title"
              className="text-neutral-700 dark:text-neutral-300 mb-2 block"
            >
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={200}
              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.title ? (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-neutral-400 tabular-nums">
                {title.length}/200
              </span>
            </div>
          </div>

          {/* Body */}
          <div>
            <Label
              htmlFor="review-body"
              className="text-neutral-700 dark:text-neutral-300 mb-2 block"
            >
              Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white resize-y"
            />
            {errors.body && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.body}
              </p>
            )}
          </div>

          {/* Pros */}
          <div>
            <Label className="text-neutral-700 dark:text-neutral-300 mb-2 block">
              Pros
            </Label>
            <div className="flex gap-2">
              <Input
                ref={proInputRef}
                value={proInput}
                onChange={(e) => setProInput(e.target.value)}
                onKeyDown={handleProKeyDown}
                placeholder="Add a pro..."
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
              <div className="flex flex-wrap gap-1.5 mt-2">
                <AnimatePresence mode="popLayout">
                  {pros.map((pro, i) => (
                    <motion.span
                      key={`${pro}-${i}`}
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
                        aria-label={`Remove pro: ${pro}`}
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
            <Label className="text-neutral-700 dark:text-neutral-300 mb-2 block">
              Cons
            </Label>
            <div className="flex gap-2">
              <Input
                ref={conInputRef}
                value={conInput}
                onChange={(e) => setConInput(e.target.value)}
                onKeyDown={handleConKeyDown}
                placeholder="Add a con..."
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
              <div className="flex flex-wrap gap-1.5 mt-2">
                <AnimatePresence mode="popLayout">
                  {cons.map((con, i) => (
                    <motion.span
                      key={`${con}-${i}`}
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
                        aria-label={`Remove con: ${con}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <Label className="text-neutral-700 dark:text-neutral-300 mb-2 block">
              Images (optional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
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
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center gap-1 text-neutral-400 dark:text-neutral-500 hover:border-[#1E4DB7] hover:text-[#1E4DB7] dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[10px] font-medium">Upload</span>
              </button>
            </div>
          </div>

          {/* Mutation Errors */}
          {(createMutation.isError || updateMutation.isError) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">
                {(createMutation.error as Error)?.message ||
                  (updateMutation.error as Error)?.message ||
                  "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
            >
              {isEditing ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewForm;
