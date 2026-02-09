// ============================================
// WEBSUMMIT GRAPHICS - INDEX EXPORTS
// Visual assets for WebSummit Qatar 2026 page
// ============================================

// Abstract Tech Shapes
export { AbstractTechShapes } from "./abstract-tech-shapes";
export { default as AbstractTechShapesDefault } from "./abstract-tech-shapes";

// Doha Skyline
export { DohaSkyline } from "./doha-skyline";
export { default as DohaSkylineDefault } from "./doha-skyline";

// Geometric Patterns
export {
  GridPattern,
  DotMatrixPattern,
  FlowingLinesPattern,
  HexagonPattern,
  CircuitPattern,
  IslamicPattern,
  DiagonalStripesPattern,
  GeometricPatterns,
} from "./geometric-patterns";
export { default as GeometricPatternsDefault } from "./geometric-patterns";

// Animated Icons
export {
  AnimatedGlobeIcon,
  AnimatedShieldIcon,
  AnimatedNetworkIcon,
  AnimatedBlockchainIcon,
  AnimatedAIIcon,
  AnimatedRocketIcon,
  AnimatedPartnershipIcon,
  AnimatedIcons,
} from "./animated-icons";
export { default as AnimatedIconsDefault } from "./animated-icons";

// Hero Visuals
export {
  GlobalNetworkGraphic,
  AbstractConnectionGraphic,
  HeroVisuals,
} from "./hero-visual";
export { default as HeroVisualsDefault } from "./hero-visual";

// Product Icons
export {
  TrustMeHubIcon,
  DigiGateIcon,
  DigiTrustIcon,
  DigiTrackIcon,
  BoaCRMIcon,
  AIAdvisoryIcon,
  CybersecurityIcon,
  CloudPlatformIcon,
  ProductIcons,
} from "./product-icons";
export { default as ProductIconsDefault } from "./product-icons";

// Event Decorations
export {
  EventBadge,
  EventBadgeSVG,
  BoothMarker,
  CountdownTimer,
  CountdownTimerComponent,
  WebSummitQatarBadge,
  EventDecorations,
} from "./event-decorations";
export { default as EventDecorationsDefault } from "./event-decorations";

// ============================================
// COMBINED GRAPHICS OBJECT
// ============================================

export const WebSummitGraphics = {
  // Decorative elements
  AbstractTechShapes: () => import("./abstract-tech-shapes"),
  DohaSkyline: () => import("./doha-skyline"),

  // Patterns
  Patterns: () => import("./geometric-patterns"),

  // Icons
  AnimatedIcons: () => import("./animated-icons"),
  ProductIcons: () => import("./product-icons"),

  // Hero elements
  HeroVisuals: () => import("./hero-visual"),

  // Event elements
  EventDecorations: () => import("./event-decorations"),
};

export default WebSummitGraphics;
