import { motion } from 'motion/react';

// ── Skeleton primitive — shimmer placeholder block ──
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-stone-200/60 rounded-2xl ${className}`}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        }}
      />
    </div>
  );
}

// ── Inline branded spinner (small) ──
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      style={{ width: size, height: size }}
      className="inline-block"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#e7e5e4" strokeWidth="2.5" />
        <path
          d="M22 12c0-5.523-4.477-10-10-10"
          stroke="url(#payze-spin-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="payze-spin-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00D4AA" />
            <stop offset="1" stopColor="#00A3FF" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// ── Card skeleton (metric/KPI block) ──
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white/80 backdrop-blur-md rounded-[32px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-24 h-3 mb-3" />
      <Skeleton className="w-32 h-7" />
    </div>
  );
}

// ── Row skeleton (transaction / list item) ──
export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between p-5 bg-white/60 rounded-[28px] border border-stone-100">
      <div className="flex items-center gap-5 flex-1">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <Skeleton className="w-20 h-5" />
    </div>
  );
}

// ── Full-page loader with branded spinner ──
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
    >
      <Spinner size={40} />
      <p className="text-stone-500 text-sm font-medium tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}

// ── Error state ──
export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full min-h-[40vh] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-stone-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
