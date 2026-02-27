import { PokemonGridSkeleton } from "@/components/state/pokemon-grid-skeleton";

export default function LoadingHome() {
  return (
    <div className="space-y-6">
      <div className="h-32 rounded-3xl border border-emerald-900/40 bg-emerald-950/50" />
      <PokemonGridSkeleton />
    </div>
  );
}
