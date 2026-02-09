import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageUrl?: string;
}

/**
 * FAQPage structured data schema.
 * Renders a valid JSON-LD script tag for Google Rich Results.
 */
export function FAQSchema({ faqs, pageUrl }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) return null;

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl || SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
}

// Default FAQs for the KTBlog homepage
export const defaultFAQs: FAQItem[] = [
  {
    question: "What is KTBlog?",
    answer:
      "KTBlog is a best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
  },
  {
    question: "What topics does KTBlog cover?",
    answer:
      "KTBlog covers a wide range of topics including artificial intelligence, cybersecurity, blockchain technology, digital transformation, cloud computing, data analytics, and IT governance, with a focus on GCC region enterprises.",
  },
  {
    question: "Is KTBlog free to read?",
    answer:
      "Yes, KTBlog offers free access to a wide selection of articles and insights. We also offer premium membership tiers for exclusive content, in-depth analysis, and early access to new articles.",
  },
  {
    question: "How can I subscribe to KTBlog updates?",
    answer:
      "You can subscribe to our newsletter by entering your email on any page. We also provide RSS and Atom feeds for feed reader integration. Visit our membership page for premium subscription options.",
  },
  {
    question: "Can I contribute to KTBlog?",
    answer:
      "We welcome expert contributors in the fields of technology, cybersecurity, AI, and digital transformation. Contact us through our website to discuss guest authorship opportunities.",
  },
];

// Pre-configured FAQ schema with default FAQs
export function HomeFAQSchema() {
  return <FAQSchema faqs={defaultFAQs} pageUrl={SITE_URL} />;
}

// Product-specific FAQs (legacy support)
export const productFAQs: Record<string, FAQItem[]> = {
  digigate: [
    {
      question: "What is DigiGate?",
      answer:
        "DigiGate is a comprehensive API gateway and lifecycle management solution that acts as the centralized control layer for an organization's entire digital infrastructure.",
    },
    {
      question: "What security features does DigiGate offer?",
      answer:
        "DigiGate provides OAuth 2.0, JWT validation, rate limiting, and threat protection for all your APIs.",
    },
  ],
};

export function ProductFAQSchema({ productId }: { productId: string }) {
  const faqs = productFAQs[productId];
  if (!faqs) return null;

  return (
    <FAQSchema
      faqs={faqs}
      pageUrl={`${SITE_URL}/products/${productId}`}
    />
  );
}
