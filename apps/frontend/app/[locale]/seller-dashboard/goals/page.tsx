'use client';

import { useState } from 'react';
import {
  useSellerGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/hooks/use-seller-growth';
import type { SellerGoal } from '@/hooks/use-seller-growth';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import {
  Target,
  Plus,
  Calendar,
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, Button, Badge } from '@ktblog/ui/components';

// ─── Constants ──────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  { value: 'revenue' as const, label: 'Revenue', icon: DollarSign },
  { value: 'sales' as const, label: 'Sales', icon: ShoppingCart },
  { value: 'products' as const, label: 'Products', icon: Package },
  { value: 'rating' as const, label: 'Rating', icon: Star },
];

const GOAL_TYPE_ICON_MAP: Record<SellerGoal['type'], typeof DollarSign> = {
  revenue: DollarSign,
  sales: ShoppingCart,
  products: Package,
  rating: Star,
};

const STATUS_BADGE_STYLES: Record<SellerGoal['status'], string> = {
  active: 'bg-[#1E4DB7]/15 text-[#6B9BFA] border-[#1E4DB7]/30',
  achieved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  missed: 'bg-red-500/15 text-red-400 border-red-500/30',
  canceled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.25 },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

function formatGoalValue(value: number, type: SellerGoal['type']): string {
  if (type === 'revenue') return `$${value.toLocaleString()}`;
  if (type === 'rating') return value.toFixed(1);
  return value.toLocaleString();
}

function getRadialColor(percent: number): string {
  if (percent >= 100) return '#22c55e';
  if (percent >= 70) return '#1E4DB7';
  if (percent >= 40) return '#F59A23';
  return '#ef4444';
}

// ─── Glass Card ─────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── Radial Progress Card ───────────────────────────────────────────────────

function GoalProgressCard({
  goal,
  onCancel,
}: {
  goal: SellerGoal;
  onCancel: (id: string) => void;
}) {
  const percent = getProgressPercent(goal.currentValue, goal.targetValue);
  const daysLeft = getDaysRemaining(goal.deadline);
  const Icon = GOAL_TYPE_ICON_MAP[goal.type];
  const color = getRadialColor(percent);

  const chartData = [{ value: percent, fill: color }];

  return (
    <motion.div
      variants={listItemVariants}
      layout
      className={cn(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl p-5 shadow-sm',
        'hover:border-[#1E4DB7]/30 dark:hover:border-[#1E4DB7]/40 transition-colors duration-300',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
              {goal.title || `${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal`}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
              {goal.type}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            'text-[10px] font-medium border',
            STATUS_BADGE_STYLES[goal.status],
          )}
        >
          {goal.status}
        </Badge>
      </div>

      {/* Radial chart */}
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={chartData}
              barSize={10}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: 'rgba(113, 113, 122, 0.15)' }}
                dataKey="value"
                cornerRadius={5}
                angleAxisId={0}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg font-bold"
              style={{ color }}
            >
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          {/* Current vs Target */}
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
              Progress
            </p>
            <p className="text-sm text-neutral-900 dark:text-white font-medium">
              {formatGoalValue(goal.currentValue, goal.type)}{' '}
              <span className="text-neutral-400 dark:text-neutral-500">
                / {formatGoalValue(goal.targetValue, goal.type)}
              </span>
            </p>
          </div>

          {/* Days remaining */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {daysLeft === 0
                ? 'Deadline today'
                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
            </span>
          </div>

          {/* Cancel button */}
          {goal.status === 'active' && (
            <button
              onClick={() => onCancel(goal.id)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                'text-red-400 hover:text-red-300 transition-colors',
              )}
            >
              <Trash2 className="h-3 w-3" />
              Cancel Goal
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SellerGoalsPage() {
  const { data: goals, isLoading } = useSellerGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  // Form state
  const [goalType, setGoalType] = useState<SellerGoal['type']>('revenue');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [title, setTitle] = useState('');

  // Archive section toggle
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Partition goals
  const allGoals: SellerGoal[] = goals ?? [];
  const activeGoals = allGoals.filter((g) => g.status === 'active');
  const archivedGoals = allGoals.filter(
    (g) => g.status === 'achieved' || g.status === 'missed' || g.status === 'canceled',
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(targetValue);
    if (!target || !deadline) return;

    createGoal.mutate(
      {
        type: goalType,
        targetValue: target,
        deadline,
        ...(title.trim() ? { title: title.trim() } : {}),
      },
      {
        onSuccess: () => {
          setTargetValue('');
          setDeadline('');
          setTitle('');
        },
      },
    );
  }

  function handleCancelGoal(id: string) {
    updateGoal.mutate({ id, status: 'canceled' });
  }

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-10 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        {/* Form skeleton */}
        <div className="h-64 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-[#1E4DB7]" />
            Goals
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* ─── Create Goal Form ──────────────────────────────────────────── */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20">
            <Plus className="h-4 w-4 text-[#1E4DB7]" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Set a New Goal
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Goal type select */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">
              Goal Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_TYPES.map((gt) => {
                const GtIcon = gt.icon;
                const isSelected = goalType === gt.value;
                return (
                  <button
                    key={gt.value}
                    type="button"
                    onClick={() => setGoalType(gt.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border',
                      isSelected
                        ? 'bg-[#1E4DB7] text-white border-[#1E4DB7] shadow-md shadow-[#1E4DB7]/20'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-[#1E4DB7]/40',
                    )}
                  >
                    <GtIcon className="h-4 w-4" />
                    {gt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target value and deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="target-value"
                className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider"
              >
                Target Value
              </label>
              <div className="relative">
                {goalType === 'revenue' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    $
                  </span>
                )}
                <input
                  id="target-value"
                  type="number"
                  min={goalType === 'rating' ? '0.1' : '1'}
                  max={goalType === 'rating' ? '5' : undefined}
                  step={goalType === 'rating' ? '0.1' : '1'}
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={goalType === 'rating' ? '4.5' : '1000'}
                  required
                  className={cn(
                    'w-full rounded-lg border border-neutral-200 dark:border-neutral-700',
                    'bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/20',
                    'outline-none transition-all duration-200',
                    'py-2.5 text-sm',
                    goalType === 'revenue' ? 'pl-7 pr-3' : 'px-3',
                  )}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider"
              >
                Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  id="deadline"
                  type="date"
                  min={minDate}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className={cn(
                    'w-full rounded-lg border border-neutral-200 dark:border-neutral-700',
                    'bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white',
                    'focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/20',
                    'outline-none transition-all duration-200',
                    'py-2.5 pl-9 pr-3 text-sm',
                  )}
                />
              </div>
            </div>
          </div>

          {/* Optional title */}
          <div>
            <label
              htmlFor="goal-title"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider"
            >
              Title{' '}
              <span className="text-neutral-400 dark:text-neutral-500 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Revenue Target"
              maxLength={100}
              className={cn(
                'w-full rounded-lg border border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/20',
                'outline-none transition-all duration-200',
                'py-2.5 px-3 text-sm',
              )}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={createGoal.isPending || !targetValue || !deadline}
            className={cn(
              'relative overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-white',
              'bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]',
              'hover:from-[#2358ca] hover:to-[#1a4aad]',
              'shadow-lg shadow-[#1E4DB7]/20 transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <span className="flex items-center gap-2">
              {createGoal.isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Goal
                </>
              )}
            </span>
          </Button>
        </form>
      </GlassCard>

      {/* ─── Active Goals ──────────────────────────────────────────────── */}
      {activeGoals.length > 0 ? (
        <div>
          <motion.h2
            variants={cardVariants}
            className="text-lg font-semibold text-neutral-900 dark:text-white mb-4"
          >
            Active Goals
          </motion.h2>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {activeGoals.map((goal) => (
                <GoalProgressCard
                  key={goal.id}
                  goal={goal}
                  onCancel={handleCancelGoal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 mb-4">
            <Target className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            No active goals
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center max-w-xs">
            Set your first goal above to start tracking your progress and stay
            motivated.
          </p>
        </GlassCard>
      )}

      {/* ─── Archive Section ───────────────────────────────────────────── */}
      {archivedGoals.length > 0 && (
        <motion.div variants={cardVariants}>
          <button
            onClick={() => setArchiveOpen((prev) => !prev)}
            className={cn(
              'w-full flex items-center justify-between',
              'rounded-xl px-5 py-4',
              'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl',
              'border border-neutral-200/60 dark:border-neutral-700/60',
              'hover:border-neutral-300 dark:hover:border-neutral-600',
              'transition-colors duration-200',
            )}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Completed &amp; Missed Goals
              </h2>
              <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-0 text-[10px]">
                {archivedGoals.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-neutral-400 transition-transform duration-300',
                archiveOpen && 'rotate-180',
              )}
            />
          </button>

          <AnimatePresence>
            {archiveOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {archivedGoals.map((goal) => (
                    <GoalProgressCard
                      key={goal.id}
                      goal={goal}
                      onCancel={handleCancelGoal}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
