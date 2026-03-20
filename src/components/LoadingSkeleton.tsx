import { Skeleton } from "@/components/ui/skeleton";

export const GameCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <Skeleton className="h-32 w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-2 w-1/2" />
    </div>
  </div>
);

export const CarouselSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-40" />
    <div className="flex gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shrink-0 w-44">
          <GameCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);
