import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PokemonNotFound() {
  return (
    <div className="space-y-6 rounded-3xl border border-emerald-900/40 bg-emerald-950/60 p-8 text-center">
      <p className="pixel-font text-xl text-primary">Pokémon no encontrado</p>
      <p className="text-sm text-emerald-100/80">
        No pudimos localizar esa entrada. Comprueba el nombre o el ID y vuelve a intentarlo.
      </p>
      <Button asChild className="pixel-font">
        <Link href="/">Volver al listado</Link>
      </Button>
    </div>
  );
}
