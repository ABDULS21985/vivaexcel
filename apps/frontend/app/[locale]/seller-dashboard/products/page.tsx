'use client';

export default function SellerProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Products</h1>
        <button className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
          Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Your products will appear here. Product management is scoped to your seller account.
        </p>
      </div>
    </div>
  );
}
