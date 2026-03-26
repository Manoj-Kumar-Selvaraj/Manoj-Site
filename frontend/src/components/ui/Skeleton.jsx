// ── Base shimmer block ────────────────────────────────────────────
// dark=true  → white-on-dark shimmer (hero section)
// dark=false → grey-on-light shimmer (canvas / surface sections)
export function Skeleton({ className = '', dark = false, rounded = 'rounded-lg', style }) {
  return (
    <span
      className={`skeleton-block ${dark ? 'skeleton-dark' : 'skeleton-light'} ${rounded} ${className}`}
      style={style}
    />
  )
}

// ── Circular spinner ──────────────────────────────────────────────
// size: 'sm' | 'md' | 'lg'
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-14 h-14 border-4',
  }
  return (
    <div
      className={`rounded-full animate-spin ${sizes[size]} ${className}`}
      style={{
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.18)',
        borderTopColor: '#2563eb',      // cobalt-600
        borderRightColor: '#60a5fa',    // cobalt-400
      }}
    />
  )
}

// ── Centred spinner inside a full section height ──────────────────
export function SectionSpinner({ dark = false }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <span className={`text-sm font-medium ${dark ? 'text-white/50' : 'text-ink-400'}`}>
          Loading…
        </span>
      </div>
    </div>
  )
}

// ── Section header skeleton (badge + title + subtitle) ────────────
export function SectionHeaderSkeleton({ dark = false, center = false }) {
  const align = center ? 'items-center' : 'items-start'
  return (
    <div className={`flex flex-col gap-3 mb-14 ${align}`}>
      <Skeleton dark={dark} className="h-6 w-28" rounded="rounded-full" />
      <Skeleton dark={dark} className="h-9 w-72 mt-1" />
      <Skeleton dark={dark} className="h-4 w-96 max-w-full" />
    </div>
  )
}

// ── Single card skeleton ──────────────────────────────────────────
export function CardSkeleton({ dark = false, lines = 3 }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton dark={dark} className="w-12 h-12 flex-shrink-0" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton dark={dark} className="h-4 w-3/4" />
          <Skeleton dark={dark} className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          dark={dark}
          className="h-3"
          style={{ width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  )
}

// ── Grid of card skeletons ────────────────────────────────────────
export function CardsGridSkeleton({ count = 3, dark = false, cols = 'md:grid-cols-3' }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} dark={dark} />
      ))}
    </div>
  )
}

// ── Hero skeleton ─────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-start sm:items-center pt-20 pb-10 sm:pb-0">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">

        {/* Avatar + name row */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton dark className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0" rounded="rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton dark className="h-5 w-40" />
            <Skeleton dark className="h-4 w-64" />
          </div>
        </div>

        {/* Large heading lines */}
        <div className="space-y-3 mb-5">
          <Skeleton dark className="h-10 w-full max-w-xl" />
          <Skeleton dark className="h-10 w-3/4 max-w-lg" />
        </div>

        {/* Bio lines */}
        <div className="space-y-2 mb-8">
          {['100%', '90%', '70%'].map((w, i) => (
            <Skeleton key={i} dark className="h-4" style={{ width: w, maxWidth: '480px' }} />
          ))}
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 max-w-sm">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} dark className="h-16" rounded="rounded-2xl" />
          ))}
        </div>

        {/* Skill chips */}
        <div className="flex flex-wrap gap-2">
          {[120, 90, 110, 100, 130, 95, 115, 105].map((w, i) => (
            <Skeleton key={i} dark className="h-8" rounded="rounded-xl" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Text block skeleton (About / bio) ────────────────────────────
export function TextBlockSkeleton({ dark = false, lines = 6 }) {
  const widths = ['100%', '95%', '100%', '88%', '100%', '65%', '92%', '100%', '70%']
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} dark={dark} className="h-4" style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  )
}

// ── Experience card skeleton ──────────────────────────────────────
export function ExpCardSkeleton({ dark = false }) {
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton dark={dark} className="w-12 h-12 flex-shrink-0" rounded="rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton dark={dark} className="h-5 w-48" />
            <Skeleton dark={dark} className="h-4 w-32" />
          </div>
        </div>
        <Skeleton dark={dark} className="w-5 h-5" rounded="rounded" />
      </div>
    </div>
  )
}
