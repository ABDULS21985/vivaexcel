"use client";

import { useState } from "react";
import {
  Mail,
  Clock,
  Twitter,
  Linkedin,
  Github,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

/* ------------------------------------------------------------------
   TYPES & VALIDATION
   ------------------------------------------------------------------ */

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const SUBJECTS = [
  { value: "", label: "Select a subject" },
  { value: "general", label: "General Inquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "partnership", label: "Partnership" },
  { value: "bug-report", label: "Bug Report" },
  { value: "other", label: "Other" },
];

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.subject) {
    errors.subject = "Please select a subject.";
  }

  if (!data.message.trim()) {
    errors.message = "Message is required.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

/* ------------------------------------------------------------------
   INFO CARDS DATA
   ------------------------------------------------------------------ */

const infoCards = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "hello@drkatangablog.com",
    description: "Drop us a line anytime",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "Within 24 hours",
    description: "We reply to every message",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: MessageSquare,
    title: "Social",
    detail: "Follow & connect",
    description: "Stay updated with our latest",
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

/* ------------------------------------------------------------------
   COMPONENT
   ------------------------------------------------------------------ */

export function ContactPageClient() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
  }

  function handleReset() {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setIsSuccess(false);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* =============================================
          HERO SECTION
          ============================================= */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Contact Us
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Have a question, feedback, or partnership idea? We would love to
              hear from you. Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          INFO CARDS
          ============================================= */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="bg-surface-1 dark:bg-surface-1 rounded-2xl p-6 border border-border text-center hover:border-primary/20 transition-colors"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor} mb-3`}
                >
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-sm font-medium text-foreground">
                  {card.detail}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>

                {/* Social links for the social card */}
                {card.title === "Social" && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <a
                      href={SOCIAL_LINKS.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={SOCIAL_LINKS.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={SOCIAL_LINKS.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          CONTACT FORM
          ============================================= */}
      <section className="py-12 md:py-20" id="contact-form">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              /* ------- Success State ------- */
              <div className="bg-surface-1 dark:bg-surface-1 rounded-2xl p-8 md:p-12 border border-border text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Message Sent!
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Thank you for reaching out. We have received your message and
                  will get back to you within 24 hours.
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition-colors btn-press"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* ------- Form ------- */
              <div className="bg-surface-1 dark:bg-surface-1 rounded-2xl p-8 md:p-10 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we will get back to you as soon as
                  possible.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-4 py-3 rounded-xl bg-background dark:bg-surface-2 border ${
                        errors.name
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      } text-foreground placeholder:text-muted-foreground outline-none transition-colors`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-background dark:bg-surface-2 border ${
                        errors.email
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      } text-foreground placeholder:text-muted-foreground outline-none transition-colors`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-background dark:bg-surface-2 border ${
                        errors.subject
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      } text-foreground outline-none transition-colors appearance-none cursor-pointer`}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what is on your mind..."
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl bg-background dark:bg-surface-2 border ${
                        errors.message
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      } text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-y min-h-[120px]`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-[#2558C8] hover:to-[#1945A0] transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed btn-press"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
