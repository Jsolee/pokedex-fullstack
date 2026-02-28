import { TypeCard } from "@/components/pokedex/type-card";
import { DataState } from "@/components/state/data-state";
import type { TypeEntry } from "@/server/type-service";
import { getTypeEntries } from "@/server/type-service";

export const dynamic = "force-dynamic";

export default async function TypesPage() {
  let types: TypeEntry[] = [];
  let failed = false;

  try {
    types = await getTypeEntries();
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <DataState
        title="Error al sincronizar"
        description="Hubo un problema consiguiendo los tipos. Reintenta más tarde."
      />
    );
  }

  if (types.length === 0) {
    return (
      <DataState
        title="Sin tipos"
        description="No pudimos cargar los tipos desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="mt-2 pixel-font text-2xl text-primary">Tipos Pokémon</h1>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {types.map((type) => (
          <TypeCard key={type.id} entry={type} />
        ))}
      </section>
    </div>
  );
}
