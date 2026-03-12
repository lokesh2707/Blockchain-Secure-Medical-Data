import { cn } from '@/lib/utils';

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="h-6 bg-muted rounded-md w-1/3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-border">
          <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
