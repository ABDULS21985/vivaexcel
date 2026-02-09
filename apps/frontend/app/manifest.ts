import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VivaExcel — Digital Products Marketplace",
    short_name: "VivaExcel",
    description:
      "Premium digital products marketplace — Excel templates, Google Sheets, presentations, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#1E4DB7",
    orientation: "portrait-primary",
    categories: ["shopping", "business", "productivity", "education"],
    dir: "auto",
    lang: "en",
    prefer_related_applications: false,
    scope: "/",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "VivaExcel Homepage",
      },
      {
        src: "/screenshots/home-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "VivaExcel Mobile",
      },
    ],
    shortcuts: [
      {
        name: "Browse Store",
        short_name: "Store",
        url: "/store",
        icons: [{ src: "/icons/shortcut-store.png", sizes: "96x96" }],
      },
      {
        name: "My Orders",
        short_name: "Orders",
        url: "/account/orders",
        icons: [{ src: "/icons/shortcut-orders.png", sizes: "96x96" }],
      },
      {
        name: "My Downloads",
        short_name: "Downloads",
        url: "/account/downloads",
        icons: [{ src: "/icons/shortcut-downloads.png", sizes: "96x96" }],
      },
    ],
  };
}
