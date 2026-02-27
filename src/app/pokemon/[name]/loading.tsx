import { PokemonGridSkeleton } from "@/components/state/pokemon-grid-skeleton";

export default function PokemonDetailLoading() {
  return (
    <div className="space-y-6">
      <PokemonGridSkeleton count={1} />
      <PokemonGridSkeleton count={2} />
    </div>
  );
}
