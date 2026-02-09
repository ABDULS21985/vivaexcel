import { Metadata } from 'next';
import { fetchSellers, fetchTopSellers } from '../../../lib/seller-api';
import { SellerCard } from '../../../components/sellers/seller-card';

export const metadata: Metadata = {
  title: 'Top Sellers | KTBlog Marketplace',
  description: 'Discover talented creators and sellers on the KTBlog marketplace.',
};

export default async function SellersPage() {
  const result = await fetchTopSellers(24);
  const sellers = result?.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Our Sellers
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Discover talented creators offering premium digital products, templates, and solutions.
          </p>
        </div>
      </section>

      {/* Sellers Grid */}
      <section className="container mx-auto px-4 py-12">
        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellers.map((seller, i) => (
              <SellerCard key={seller.id} seller={seller} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              No sellers available yet. Be the first to join!
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
