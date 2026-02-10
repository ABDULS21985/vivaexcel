// VivaExcel Service Worker v1
// Caching strategies: Cache First (static), Network First (API/HTML), Stale While Revalidate (images)

const CACHE_NAME = "vivaexcel-v1";
const STATIC_CACHE = "vivaexcel-static-v1";
const DYNAMIC_CACHE = "vivaexcel-dynamic-v1";
const IMAGE_CACHE = "vivaexcel-images-v1";

const CACHE_VERSIONS = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

// URLs to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Cache duration constants (in milliseconds)
const STATIC_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
const IMAGE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_TIMEOUT = 5000; // 5 seconds

// Max entries per cache
const IMAGE_CACHE_LIMIT = 100;
const DYNAMIC_CACHE_LIMIT = 50;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check if a cached response has expired based on a custom header we store.
 */
function isCacheExpired(response, maxAge) {
  if (!response) return true;
  const cachedAt = response.headers.get("sw-cached-at");
  if (!cachedAt) return false; // no timestamp means legacy cache, treat as valid
  return Date.now() - parseInt(cachedAt, 10) > maxAge;
}

/**
 * Clone a response and stamp it with the current time for expiry tracking.
 */
function stampResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("sw-cached-at", Date.now().toString());

  return response.blob().then(function (body) {
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  });
}

/**
 * Trim a cache to a maximum number of entries by evicting the oldest first.
 */
function trimCache(cacheName, maxItems) {
  return caches.open(cacheName).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length <= maxItems) return;
      // Delete oldest entries until we are under the limit
      var deleteCount = keys.length - maxItems;
      var deletions = [];
      for (var i = 0; i < deleteCount; i++) {
        deletions.push(cache.delete(keys[i]));
      }
      return Promise.all(deletions);
    });
  });
}

/**
 * Create a network request with a timeout. Rejects if the network doesn't
 * respond within `ms` milliseconds.
 */
function fetchWithTimeout(request, ms) {
  return new Promise(function (resolve, reject) {
    var timeoutId = setTimeout(function () {
      reject(new Error("Network request timed out"));
    }, ms);

    fetch(request)
      .then(function (response) {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

// ─── Route matchers ─────────────────────────────────────────────────────────

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|otf|eot)(\?.*)?$/i.test(url.pathname);
}

function isImage(url) {
  return /\.(png|jpe?g|gif|svg|webp|avif|ico)(\?.*)?$/i.test(url.pathname);
}

function isApiRoute(url) {
  return url.pathname.startsWith("/api/");
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

// ─── Caching strategies ─────────────────────────────────────────────────────

/**
 * Cache First — suited for static assets (CSS, JS, fonts).
 * Serves from cache if available and not expired; otherwise fetches from network,
 * caches the response, and returns it.
 */
function cacheFirst(request, cacheName, maxAge) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cachedResponse) {
      if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
        return cachedResponse;
      }

      return fetch(request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            return stampResponse(networkResponse.clone()).then(function (stamped) {
              cache.put(request, stamped);
              return networkResponse;
            });
          }
          // If network fails but we have a stale cache, return it
          if (cachedResponse) return cachedResponse;
          return networkResponse;
        })
        .catch(function () {
          // Offline — return stale cache if available
          if (cachedResponse) return cachedResponse;
          return new Response("", { status: 408, statusText: "Offline" });
        });
    });
  });
}

/**
 * Network First — suited for API calls and HTML pages.
 * Tries network with a timeout, falls back to cache, and ultimately to offline page
 * for navigation requests.
 */
function networkFirst(request, cacheName, timeoutMs) {
  return caches.open(cacheName).then(function (cache) {
    return fetchWithTimeout(request, timeoutMs)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          trimCache(cacheName, DYNAMIC_CACHE_LIMIT);
        }
        return networkResponse;
      })
      .catch(function () {
        return cache.match(request).then(function (cachedResponse) {
          if (cachedResponse) return cachedResponse;

          // For navigation requests, serve the offline page
          if (isNavigationRequest(request)) {
            return caches.match("/offline");
          }

          return new Response(
            JSON.stringify({ error: "You are offline" }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        });
      });
  });
}

/**
 * Stale While Revalidate — suited for product images and thumbnails.
 * Returns the cached version immediately (if available) while fetching
 * an updated version in the background.
 */
function staleWhileRevalidate(request, cacheName, maxAge) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cachedResponse) {
      var networkFetch = fetch(request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            return stampResponse(networkResponse.clone()).then(function (stamped) {
              cache.put(request, stamped);
              trimCache(cacheName, IMAGE_CACHE_LIMIT);
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // Network failed silently — cached version is already being returned
          return cachedResponse;
        });

      // If we have a cached response that is not expired, return it immediately
      if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
        return cachedResponse;
      }

      // Otherwise wait for network
      return networkFetch;
    });
  });
}

// ─── Install event ──────────────────────────────────────────────────────────

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// ─── Activate event ─────────────────────────────────────────────────────────

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              // Delete any cache that isn't one of our current versions
              return CACHE_VERSIONS.indexOf(name) === -1;
            })
            .map(function (name) {
              return caches.delete(name);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// ─── Fetch event ────────────────────────────────────────────────────────────

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // Only handle http(s) requests from our own origin or CDN
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  // Skip chrome-extension and other non-standard requests
  if (!url.protocol.startsWith("http")) return;

  // Strategy routing
  if (isStaticAsset(url)) {
    // Static assets — Cache First with 30-day expiry
    event.respondWith(cacheFirst(event.request, STATIC_CACHE, STATIC_MAX_AGE));
    return;
  }

  if (isImage(url)) {
    // Images — Stale While Revalidate with 7-day expiry
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE, IMAGE_MAX_AGE));
    return;
  }

  if (isApiRoute(url)) {
    // API routes — Network First with 5s timeout
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE, API_TIMEOUT));
    return;
  }

  if (isNavigationRequest(event.request)) {
    // Navigation (HTML pages) — Network First with 5s timeout
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE, API_TIMEOUT));
    return;
  }

  // Default: Network First for everything else
  event.respondWith(networkFirst(event.request, DYNAMIC_CACHE, API_TIMEOUT));
});

// ─── Push notification handler ────────────────────────────────────────────

self.addEventListener("push", function (event) {
  if (!event.data) return;

  var data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "New Notification",
      body: event.data.text(),
    };
  }

  var options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [],
    tag: data.data && data.data.notificationId
      ? "notification-" + data.data.notificationId
      : "notification-" + Date.now(),
    renotify: true,
  };

  // Add action button if URL provided
  if (data.data && data.data.url) {
    options.actions.push({
      action: "open",
      title: "View",
    });
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", options)
  );
});

// ─── Notification click handler ──────────────────────────────────────────

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var url = "/";
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, focus it and navigate
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          if (url !== "/") {
            client.navigate(url);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ─── Background sync placeholder ───────────────────────────────────────────

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
