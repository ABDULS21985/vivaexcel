import { onLCP, onCLS, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

let metricsBuffer: Array<{ name: string; value: number; rating: string }> = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function bufferMetric(metric: Metric): void {
  metricsBuffer.push({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    flushMetrics();
  }, 5000);
}

function flushMetrics(): void {
  if (metricsBuffer.length === 0) return;

  const payload = {
    route: window.location.pathname,
    metrics: [...metricsBuffer],
    userAgent: navigator.userAgent,
    connectionType: (navigator as any).connection?.effectiveType || undefined,
  };

  metricsBuffer = [];

  // Use sendBeacon for reliable delivery, fallback to fetch
  const body = JSON.stringify(payload);
  const url = `${API_URL}/monitoring/performance/web-vitals`;

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently fail - metrics reporting should not affect UX
    });
  }
}

export function reportWebVitals(): void {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    onLCP(bufferMetric);
    onCLS(bufferMetric);
    onFCP(bufferMetric);
    onTTFB(bufferMetric);
    onINP(bufferMetric);
  } catch {
    // web-vitals not available
  }
}
