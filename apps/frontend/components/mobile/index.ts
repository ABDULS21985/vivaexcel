// =============================================================================
// Mobile Components — Barrel Export
// =============================================================================

export { FilterBottomSheet } from "./filter-bottom-sheet";
export type { FilterBottomSheetProps, FilterState } from "./filter-bottom-sheet";
export { MobileBottomNav } from "./mobile-bottom-nav";
export { MobileTopBar } from "./mobile-top-bar";
export { MobileSearchOverlay } from "./mobile-search-overlay";
export { MobileCart } from "./mobile-cart";
export { MobileStickyBar } from "./mobile-sticky-bar";
export type { MobileStickyBarProps } from "./mobile-sticky-bar";
export { MobileCollapsibleSections, createDefaultProductSections } from "./mobile-collapsible-sections";
export type { MobileCollapsibleSectionsProps, CollapsibleSection } from "./mobile-collapsible-sections";
export { MobileShareButton } from "./mobile-share-button";
export type { MobileShareButtonProps } from "./mobile-share-button";

// Touch interaction utilities
export { TouchTarget } from "./touch-target";
export type { TouchTargetProps } from "./touch-target";
export { PressFeedback } from "./press-feedback";
export type { PressFeedbackProps } from "./press-feedback";
export { MobileContextMenu } from "./context-menu";
export type { MobileContextMenuProps, ContextMenuItem } from "./context-menu";
export { PullToRefresh } from "./pull-to-refresh";
export type { PullToRefreshProps } from "./pull-to-refresh";

// Mobile accessibility utilities
export {
  FocusIndicator,
  ReduceMotionWrapper,
  DynamicTextSize,
  HighContrastMode,
  ScreenReaderOnly,
} from "./mobile-accessibility";
export type {
  FocusIndicatorProps,
  ReduceMotionWrapperProps,
  DynamicTextSizeProps,
  HighContrastModeProps,
} from "./mobile-accessibility";
