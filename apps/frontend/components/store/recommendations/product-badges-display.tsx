"use client";

import { useProductBadges } from "@/hooks/use-recommendations";
import { ProductBadge } from "./product-badge";

// =============================================================================
// Types
// =============================================================================

interface ProductBadgesDisplayProps {
  productId: string;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Fetches and renders product badges as an overlay layer.
 * Intended to be positioned absolutely within a product card.
 */
export function ProductBadgesDisplay({
  productId,
  className = "",
}: ProductBadgesDisplayProps) {
  const { data: badges, isLoading } = useProductBadges(productId);

  if (isLoading || !badges || badges.length === 0) return null;

  return (
    <div
      className={`absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1 ${className}`}
    >
      {badges.map((badge) => (
        <ProductBadge key={badge} badge={badge} />
      ))}
    </div>
  );
}

export default ProductBadgesDisplay;
