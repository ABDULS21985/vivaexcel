"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  Download,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@ktblog/ui/components";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useMyAnalyticsOverview,
  useMyRevenueSeries,
  useMyTopProducts,
  useMyConversionFunnel,
  useMyTrafficSources,
  useMyPurchaseBreakdown,
  type SellerOverviewData,
  type BuyerOverviewData,
} from "@/hooks/use-analytics";

// =============================================================================
// Constants
// =============================================================================

const PERIODS = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
] as const;

const PIE_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
];

// =============================================================================
// Helpers
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// =============================================================================
// Sub-components
// =============================================================================

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-[var(--muted-foreground)]">0%</span>;
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {change !== undefined && <ChangeIndicator value={change} />}
      </div>
      <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
    </div>
  );
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: string;
  onChange: (p: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-[var(--surface-1)] p-1 rounded-lg">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            period === p.value
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label, isCurrency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {isCurrency ? formatCurrency(entry.value) : formatCompact(entry.value)}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Seller Analytics View
// =============================================================================

function SellerAnalytics({
  overview,
  period,
}: {
  overview: SellerOverviewData;
  period: string;
}) {
  const { data: revenueSeries, isLoading: revenueLoading } = useMyRevenueSeries(period, "day");
  const { data: topProducts } = useMyTopProducts(period);
  const { data: funnel } = useMyConversionFunnel(period);
  const { data: traffic } = useMyTrafficSources(period);

  const chartData = (revenueSeries?.timeSeries ?? []).map((p) => ({
    date: formatDate(p.period),
    revenue: p.amount,
    orders: p.orderCount,
  }));

  const trafficData = (traffic?.sources ?? []).map((s, i) => ({
    name: s.source.charAt(0) + s.source.slice(1).toLowerCase(),
    value: s.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={formatCurrency(overview.revenue)}
          change={overview.revenueChange}
          icon={DollarSign}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Orders"
          value={formatCompact(overview.orders)}
          change={overview.ordersChange}
          icon={ShoppingCart}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Views"
          value={formatCompact(overview.views)}
          change={overview.viewsChange}
          icon={Eye}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Conversion Rate"
          value={formatPercent(overview.conversionRate)}
          change={overview.conversionRateChange}
          icon={TrendingUp}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Revenue Over Time</h2>
        {revenueLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[var(--muted-foreground)]">
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${formatCompact(v)}`}
              />
              <Tooltip content={<ChartTooltip isCurrency />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two-column: Top Products + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Top Products</h2>
          </div>
          {!topProducts?.products?.length ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              No product data yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Product</th>
                    <th className="text-right p-3 text-[var(--muted-foreground)] font-medium">Views</th>
                    <th className="text-right p-3 text-[var(--muted-foreground)] font-medium">Sales</th>
                    <th className="text-right p-3 text-[var(--muted-foreground)] font-medium">Revenue</th>
                    <th className="text-right p-3 text-[var(--muted-foreground)] font-medium">Conv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {topProducts.products.map((product, i) => (
                    <tr key={product.digitalProductId} className="hover:bg-[var(--surface-1)] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--muted-foreground)] w-5">{i + 1}.</span>
                          <span className="text-[var(--foreground)] truncate max-w-[200px]">
                            {product.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-[var(--muted-foreground)]">
                        {formatCompact(product.views)}
                      </td>
                      <td className="p-3 text-right text-[var(--muted-foreground)]">
                        {formatCompact(product.conversions)}
                      </td>
                      <td className="p-3 text-right font-medium text-[var(--foreground)]">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="p-3 text-right text-[var(--muted-foreground)]">
                        {product.conversionRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Traffic Sources</h2>
          {trafficData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)]">
              No traffic data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {trafficData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-[var(--muted-foreground)]">{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCompact(value),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--foreground)]">Conversion Funnel</h2>
          {funnel && (
            <span className="text-xs text-[var(--muted-foreground)]">
              Overall: {funnel.overallConversionRate.toFixed(2)}%
            </span>
          )}
        </div>
        {!funnel?.stages?.length ? (
          <div className="text-center text-[var(--muted-foreground)] py-8">
            No conversion data yet
          </div>
        ) : (
          <div className="space-y-3">
            {funnel.stages.map((stage, i) => {
              const maxCount = funnel.stages[0]?.count || 1;
              const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--foreground)]">{stage.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {formatCompact(stage.count)}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] w-14 text-right">
                        {stage.rate.toFixed(1)}%
                      </span>
                      {i > 0 && stage.dropoffRate > 0 && (
                        <span className="text-xs text-red-500 w-16 text-right">
                          -{stage.dropoffRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${Math.max(widthPercent, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// =============================================================================
// Buyer Analytics View
// =============================================================================

function BuyerAnalytics({
  overview,
  period,
}: {
  overview: BuyerOverviewData;
  period: string;
}) {
  const { data: revenueSeries, isLoading: spendingLoading } = useMyRevenueSeries(period, "day");
  const { data: purchases } = useMyPurchaseBreakdown(period);

  const chartData = (revenueSeries?.timeSeries ?? []).map((p) => ({
    date: formatDate(p.period),
    spending: p.amount,
    orders: p.orderCount,
  }));

  const categoryData = (purchases?.categories ?? []).map((c, i) => ({
    name: c.categoryName,
    value: c.totalSpent,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Spent"
          value={formatCurrency(overview.totalSpent)}
          change={overview.totalSpentChange}
          icon={DollarSign}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Orders"
          value={formatCompact(overview.orders)}
          change={overview.ordersChange}
          icon={ShoppingCart}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Downloads"
          value={formatCompact(overview.downloads)}
          icon={Download}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Products Owned"
          value={formatCompact(overview.productsOwned)}
          icon={Package}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Spending Chart */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Spending Over Time</h2>
        {spendingLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[var(--muted-foreground)]">
            No spending data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${formatCompact(v)}`}
              />
              <Tooltip content={<ChartTooltip isCurrency />} />
              <Area
                type="monotone"
                dataKey="spending"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#spendingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two-column: Categories + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Spending by Category
          </h2>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)]">
              No purchase data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-[var(--muted-foreground)]">{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Recent Orders</h2>
          </div>
          {!purchases?.recentOrders?.length ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3" />
              <p className="text-[var(--muted-foreground)] text-sm">
                No orders yet
              </p>
              <Link
                href="/store"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-[var(--primary)] hover:underline"
              >
                Browse Products
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {purchases.recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="p-4 hover:bg-[var(--surface-1)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {order.items[0]?.productTitle ?? `Order #${order.orderNumber}`}
                      {order.items.length > 1 && (
                        <span className="text-[var(--muted-foreground)]">
                          {" "}+{order.items.length - 1} more
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
                        order.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Main Page
// =============================================================================

function AnalyticsContent() {
  const [period, setPeriod] = useState("30d");
  const { data: overview, isLoading } = useMyAnalyticsOverview(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-24">
        <BarChart3 className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">
          Unable to load analytics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Analytics
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {overview.mode === "seller"
              ? "Track your sales performance and product insights"
              : "Track your purchases and spending patterns"}
          </p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {/* Role-adaptive content */}
      {overview.mode === "seller" ? (
        <SellerAnalytics overview={overview} period={period} />
      ) : (
        <BuyerAnalytics overview={overview} period={period} />
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
