import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  );
}

/**
 * Generate breadcrumb items from a URL path.
 * Automatically creates hierarchical breadcrumbs.
 */
export function generateBreadcrumbs(path: string): BreadcrumbItem[] {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", url: SITE_URL },
  ];

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = formatBreadcrumbName(segment);
    breadcrumbs.push({
      name,
      url: `${SITE_URL}${currentPath}`,
    });
  });

  return breadcrumbs;
}

// Format segment name for display
function formatBreadcrumbName(segment: string): string {
  const nameMap: Record<string, string> = {
    about: "About Us",
    contact: "Contact",
    blogs: "Blog",
    blog: "Blog",
    membership: "Membership",
    search: "Search",
    author: "Authors",
    category: "Categories",
    tag: "Tags",
    dashboard: "Dashboard",
    login: "Login",
    register: "Register",
    services: "Services",
    products: "Products",
    training: "Training",
    careers: "Careers",
    industries: "Industries",
    "case-studies": "Case Studies",
    cybersecurity: "Cybersecurity",
    "ai-data": "AI & Data",
    blockchain: "Blockchain",
    "it-governance": "IT Governance",
    "digital-transformation": "Digital Transformation",
    "products-services": "Products & Services",
  };

  return (
    nameMap[segment.toLowerCase()] ||
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

// Pre-configured breadcrumbs for common pages
export function HomeBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[{ name: "Home", url: SITE_URL }]}
    />
  );
}

export function AboutBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "About Us", url: `${SITE_URL}/about` },
      ]}
    />
  );
}

export function ContactBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Contact", url: `${SITE_URL}/contact` },
      ]}
    />
  );
}

export function ProductsBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Products", url: `${SITE_URL}/products` },
      ]}
    />
  );
}

export function ProductDetailBreadcrumb({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Products", url: `${SITE_URL}/products` },
        {
          name: productName,
          url: `${SITE_URL}/products/${productId}`,
        },
      ]}
    />
  );
}

export function ServicesBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Services", url: `${SITE_URL}/services` },
      ]}
    />
  );
}

export function ServiceDetailBreadcrumb({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName: string;
}) {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Services", url: `${SITE_URL}/services` },
        {
          name: serviceName,
          url: `${SITE_URL}/services/${serviceId}`,
        },
      ]}
    />
  );
}

export function TrainingBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Training", url: `${SITE_URL}/training` },
      ]}
    />
  );
}

export function BlogBreadcrumb() {
  return (
    <BreadcrumbSchema
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Blog", url: `${SITE_URL}/blogs` },
      ]}
    />
  );
}
