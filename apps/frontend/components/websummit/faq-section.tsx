"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

// ============================================
// TYPES
// ============================================

interface FAQItem {
  question: string;
  answer: string;
}

// ============================================
// CONSTANTS
// ============================================

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Where can we find Digibit at Web Summit Qatar 2026?",
    answer:
      "Visit us at Booth A5-35 in the main exhibition hall at the Doha Exhibition and Convention Center. Our exhibition day is Monday, February 2, 2026.",
  },
  {
    question: "How can I schedule a private meeting or demo?",
    answer:
      "Use our contact form below or email connect@globaldigibit.com to schedule a dedicated meeting slot. We offer 30-minute private demos of TrustMeHub, DigiGate, DigiTrack, DigiTrust, and BoaCRM.",
  },
  {
    question: "What solutions will Digibit be showcasing?",
    answer:
      "We'll demonstrate our full product suite including TrustMeHub (credential verification), DigiGate (API gateway), DigiTrust (blockchain credentials), DigiTrack (real-time tracking), and BoaCRM (banking CRM), along with our consulting and training services.",
  },
  {
    question: "Is Digibit's platform compliant with Qatar regulations?",
    answer:
      "Yes. Our solutions are designed to comply with Qatar Central Bank standards, Qatar Data Protection Law, National Information Assurance policies, and international frameworks including ISO 27001, NIST, GDPR, and PCI-DSS.",
  },
  {
    question: "Do you offer solutions for government entities?",
    answer:
      "Absolutely. We specialize in public sector modernization including national ID systems, e-government platforms, CBDC advisory, and digital credential infrastructure. We currently serve multiple government agencies across Africa and the Middle East.",
  },
  {
    question: "What investment opportunities are available?",
    answer:
      "We welcome conversations with strategic investors, venture capital firms, and corporate partners interested in digital trust infrastructure, AI/ML platforms, and blockchain solutions with proven market traction across 50+ countries.",
  },
  {
    question: "Do you provide training and capability building?",
    answer:
      "Yes, we offer executive programs (AI for Leaders, Cybersecurity Leadership), technical programs (ML, Smart Contracts, Incident Response), and compliance training (ISO 27001, QCB Standards, Data Protection) \u2014 available as workshops, bootcamps, or custom engagements.",
  },
  {
    question: "How can I access the investor deck or partnership materials?",
    answer:
      "Request our materials through the contact form below or email partnerships@globaldigibit.com. We'll share our investor deck, product briefs, and partnership frameworks within 24 hours.",
  },
];

// ============================================
// SUBCOMPONENTS
// ============================================

function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  isVisible,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isVisible: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`border rounded-xl overflow-hidden mb-3 transition-all duration-500 ${isOpen
          ? "border-primary/20 bg-primary/5"
          : "border-neutral-light bg-white hover:border-neutral-gray/20"
        }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${200 + index * 80}ms`,
        transitionProperty: "opacity, transform, background-color, border-color",
      }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-5 cursor-pointer hover:bg-neutral-light/50 transition-colors duration-200 text-left"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-medium text-secondary pr-4">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-neutral-gray flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""
            }`}
        />
      </button>

      {/* Answer - animated max-height */}
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div ref={contentRef} className="px-5 pb-5">
          <p className="text-neutral-gray text-sm leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitFAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
      aria-label="Frequently asked questions"
    >
      {/* Subtle top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          {/* Badge */}
          <div
            className={`transition-all duration-700 ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
              }`}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
          </div>

          {/* Title */}
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4 transition-all duration-700 delay-100 ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
              }`}
          >
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-orange">
              Know
            </span>
          </h2>
        </div>

        {/* FAQ accordion */}
        <div>
          {FAQ_ITEMS.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WebSummitFAQ;
