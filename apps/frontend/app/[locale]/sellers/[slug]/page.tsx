import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchSellerBySlug } from '../../../../lib/seller-api';
import { VERIFICATION_LABELS, VERIFICATION_COLORS, VerificationStatus } from '../../../../types/seller';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seller = await fetchSellerBySlug(slug);
  if (!seller) return { title: 'Seller Not Found' };

  return {
    title: `${seller.displayName} | KTBlog Marketplace`,
    description: seller.bio || `Check out products by ${seller.displayName}`,
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const { slug } = await params;
  const seller = await fetchSellerBySlug(slug);
  if (!seller) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 to-primary/5 relative">
        {seller.coverImage && (
          <Image src={seller.coverImage} alt="" fill className="object-cover" />
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-800 overflow-hidden bg-zinc-200 dark:bg-zinc-700 shadow-lg">
            {seller.avatar ? (
              <Image
                src={seller.avatar}
                alt={seller.displayName}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-400">
                {seller.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {seller.displayName}
              </h1>
              {seller.verificationStatus !== VerificationStatus.UNVERIFIED && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${VERIFICATION_COLORS[seller.verificationStatus]}`}>
                  {VERIFICATION_LABELS[seller.verificationStatus]}
                </span>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-white">{seller.totalSales}</span> sales
              </div>
              {Number(seller.averageRating) > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-zinc-900 dark:text-white">{Number(seller.averageRating).toFixed(1)}</span>
                </div>
              )}
              {seller.website && (
                <a
                  href={seller.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">About</h2>
              {seller.bio ? (
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{seller.bio}</p>
              ) : (
                <p className="text-zinc-400 italic">No bio provided</p>
              )}

              {seller.specialties && seller.specialties.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {seller.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {seller.socialLinks && Object.keys(seller.socialLinks).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Connect</h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(seller.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline capitalize"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Placeholder */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Products</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                Products by this seller will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
