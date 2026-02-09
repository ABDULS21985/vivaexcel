import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
const SITE_NAME = "KTBlog";
const LOGO_URL = `${SITE_URL}/logo/ktblog.png`;

/**
 * Organization structured data for KTBlog.
 * Includes name, URL, logo, social links, and contact point.
 */
export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    description:
      "KTBlog is a best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    sameAs: [
      "https://www.linkedin.com/company/ktblog",
      "https://twitter.com/ktblog",
      "https://www.facebook.com/ktblog",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Arabic"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData),
      }}
    />
  );
}
