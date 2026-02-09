'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { SellerProfile } from '../../types/seller';
import { VERIFICATION_LABELS, VERIFICATION_COLORS, VerificationStatus } from '../../types/seller';

interface SellerCardProps {
  seller: SellerProfile;
  index?: number;
}

export function SellerCard({ seller, index = 0 }: SellerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/sellers/${seller.slug}`}
        className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 relative">
          {seller.coverImage && (
            <Image
              src={seller.coverImage}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Avatar & Info */}
        <div className="px-5 pb-5 -mt-8 relative">
          <div className="w-16 h-16 rounded-full border-4 border-white dark:border-zinc-800 overflow-hidden bg-zinc-200 dark:bg-zinc-700 mb-3">
            {seller.avatar ? (
              <Image
                src={seller.avatar}
                alt={seller.displayName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                {seller.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
            {seller.displayName}
          </h3>

          {seller.verificationStatus !== VerificationStatus.UNVERIFIED && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${VERIFICATION_COLORS[seller.verificationStatus]}`}>
              {VERIFICATION_LABELS[seller.verificationStatus]}
            </span>
          )}

          {seller.bio && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {seller.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{seller.totalSales} sales</span>
            {Number(seller.averageRating) > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Number(seller.averageRating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Specialties */}
          {seller.specialties && seller.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {seller.specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
