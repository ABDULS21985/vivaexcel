"use client";

import { useEffect, useRef } from "react";

/**
 * ServiceWorkerRegister
 *
 * Registers the service worker on mount (after window load).
 * In production, handles SW updates by dispatching a custom event
 * that other components (e.g. an update banner) can listen for.
 * In development, logs registration status to the console.
 */
export function ServiceWorkerRegister() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isDev = process.env.NODE_ENV === "development";

    function registerSW() {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          registrationRef.current = registration;

          if (isDev) {
            console.log("[SW] Service worker registered successfully", registration.scope);
          }

          // Listen for new service worker installing
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            if (isDev) {
              console.log("[SW] New service worker found, state:", newWorker.state);
            }

            newWorker.addEventListener("statechange", () => {
              if (isDev) {
                console.log("[SW] Service worker state changed to:", newWorker.state);
              }

              // A new SW has installed and is waiting to activate
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                if (isDev) {
                  console.log("[SW] New content available; update ready.");
                }

                // Dispatch a custom event so UI components can show an update banner
                window.dispatchEvent(
                  new CustomEvent("sw-update-available", {
                    detail: { registration },
                  })
                );
              }
            });
          });
        })
        .catch((error) => {
          if (isDev) {
            console.error("[SW] Service worker registration failed:", error);
          }
        });

      // When a new service worker takes over, reload to get fresh content
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    // Register after the window has fully loaded to avoid blocking initial paint
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }

    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, []);

  return null;
}
