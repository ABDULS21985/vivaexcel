'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubmitApplication, useMyApplication } from '../../../hooks/use-sellers';

export default function BecomeASellerPage() {
  const { data: existingApp, isLoading: loadingApp } = useMyApplication();
  const submitMutation = useSubmitApplication();

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    website: '',
    experienceDescription: '',
    applicationNote: '',
    specialties: [] as string[],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMutation.mutateAsync(form);
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !form.specialties.includes(specialtyInput.trim())) {
      setForm({ ...form, specialties: [...form.specialties, specialtyInput.trim()] });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (s: string) => {
    setForm({ ...form, specialties: form.specialties.filter((x) => x !== s) });
  };

  if (loadingApp) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </main>
    );
  }

  if (existingApp) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Application Status</h1>
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              existingApp.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : existingApp.status === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {existingApp.status === 'pending' ? 'Under Review' : existingApp.status.charAt(0).toUpperCase() + existingApp.status.slice(1)}
            </div>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              {existingApp.status === 'pending'
                ? 'Your application is being reviewed. We will notify you once a decision is made.'
                : existingApp.status === 'approved'
                ? 'Congratulations! Your application has been approved. Visit your seller dashboard to get started.'
                : 'Unfortunately, your application was not approved.'}
            </p>
            {existingApp.reviewNotes && (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 italic">
                Reviewer notes: {existingApp.reviewNotes}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4"
          >
            Become a Seller
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
          >
            Join our marketplace and start selling your digital products to a global audience.
          </motion.p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Global Reach', desc: 'Sell to customers worldwide with built-in payments and delivery.' },
            { title: '80% Revenue Share', desc: 'Keep 80% of every sale. Low platform commission of 20%.' },
            { title: 'Easy Payouts', desc: 'Automatic payouts via Stripe Connect on your preferred schedule.' },
          ].map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="container mx-auto px-4 pb-16 max-w-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">Apply Now</h2>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
              placeholder="Your seller name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
              placeholder="Tell us about yourself"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Experience</label>
            <textarea
              rows={3}
              value={form.experienceDescription}
              onChange={(e) => setForm({ ...form, experienceDescription: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
              placeholder="Describe your experience creating digital products"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Specialties</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
                placeholder="e.g. Web Templates, PowerPoint"
              />
              <button type="button" onClick={addSpecialty} className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.specialties.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => removeSpecialty(s)} className="ml-1 hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Why do you want to sell?</label>
            <textarea
              rows={3}
              value={form.applicationNote}
              onChange={(e) => setForm({ ...form, applicationNote: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
              placeholder="Tell us what motivates you to sell on our platform"
            />
          </div>

          {submitMutation.isError && (
            <p className="text-red-500 text-sm">{submitMutation.error?.message}</p>
          )}

          <button
            type="submit"
            disabled={submitMutation.isPending || !form.displayName}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </section>
    </main>
  );
}
