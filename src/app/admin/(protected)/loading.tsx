export default function AdminLoading() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading admin content</span>
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-[28rem] max-w-full animate-pulse rounded bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[14px] border border-white/10 bg-white/[0.025]" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[14px] border border-white/10 bg-white/[0.025]" />
    </div>
  );
}
