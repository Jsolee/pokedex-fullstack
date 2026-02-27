import { Skeleton } from "@/components/ui/skeleton";

export function PokemonGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-emerald-900/50 bg-card/30 p-4">
          <Skeleton className="h-4 w-20 bg-emerald-900/40" />
          <Skeleton className="mx-auto my-6 h-32 w-32 rounded-full bg-emerald-900/20" />
          <Skeleton className="h-5 w-32 bg-emerald-900/30" />
        </div>
      ))}
    </div>
  );
}
