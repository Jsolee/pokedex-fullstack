import { PokemonGridSkeleton } from "@/components/state/pokemon-grid-skeleton";
import { PokedexLoader } from "@/components/state/pokedex-loader";

export default function LoadingHome() {
  return (
    <div className="space-y-8">
      <PokedexLoader />
      <PokemonGridSkeleton count={6} />
    </div>
  );
}
