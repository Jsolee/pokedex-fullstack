import { Skeleton } from "@/components/ui/skeleton";

const shimmerVariants = [
  "animate-[pokedexShimmer_2s_linear_infinite]",
  "animate-[pokedexShimmer_2.4s_linear_infinite]",
  "animate-[pokedexShimmer_2.2s_linear_infinite]",
];

export function PokemonGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-3xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/70 via-emerald-900/20 to-emerald-950/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.45)]"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/15 to-transparent ${shimmerVariants[index % shimmerVariants.length]}`}
          />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between text-xs uppercase text-emerald-200/70">
              <span className="pixel-font tracking-[0.3em]">Dex</span>
              <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-200/90">
                Escaneando
              </span>
            </div>
            <div className="flex items-center justify-center">
              <div className="pokedex-scan-orb">
                <div className="pokedex-scan-orb__ring" />
                <div className="pokedex-scan-orb__dot" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 bg-emerald-900/40" />
              <Skeleton className="h-4 w-20 bg-emerald-900/30" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((stat) => (
                <div key={stat} className="rounded-full border border-emerald-900/40 p-2">
                  <div className="h-2 rounded-full bg-emerald-700/40">
                    <div
                      className="h-full rounded-full bg-emerald-400/80"
                      style={{ width: `${30 + stat * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
