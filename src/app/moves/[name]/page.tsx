import { notFound } from "next/navigation";

import { BackButton } from "@/components/navigation/back-button";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { formatSlug } from "@/lib/format";
import { getMoveDetail } from "@/server/move-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ name: string }> | { name: string };
};

export default async function MoveDetailPage({ params }: PageProps) {
  const { name } = await params;

  try {
    const move = await getMoveDetail(name);
    if (!move) {
      notFound();
    }

    const effect =
      move.effect_entries.find((entry) => entry.language.name === "es")?.short_effect ??
      move.effect_entries.find((entry) => entry.language.name === "en")?.short_effect ??
      "Sin efecto disponible.";

    const flavor =
      move.flavor_text_entries.find((entry) => entry.language.name === "es")?.flavor_text ??
      move.flavor_text_entries.find((entry) => entry.language.name === "en")?.flavor_text ??
      "Sin descripción disponible.";

    return (
      <div className="space-y-8">
        <BackButton />
        <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
          <p className="pixel-font text-xs text-emerald-300">Movimiento</p>
          <h1 className="mt-3 text-2xl font-black text-primary">{formatSlug(move.name)}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">Tipo: {move.type?.name ?? "-"}</Badge>
            <Badge variant="secondary">Clase: {move.damage_class?.name ?? "-"}</Badge>
            <Badge variant="secondary">PP: {move.pp ?? "-"}</Badge>
            <Badge variant="secondary">Poder: {move.power ?? "-"}</Badge>
            <Badge variant="secondary">Precisión: {move.accuracy ?? "-"}</Badge>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-emerald-900/40 bg-emerald-950/40 p-6 md:grid-cols-2">
          <div>
            <p className="pixel-font text-xs uppercase text-emerald-300">Efecto</p>
            <p className="mt-3 text-sm text-emerald-200/80">{effect}</p>
          </div>
          <div>
            <p className="pixel-font text-xs uppercase text-emerald-300">Descripción</p>
            <p className="mt-3 text-sm text-emerald-200/80">{flavor.replace(/\s+/g, " ")}</p>
          </div>
        </section>

        <DataState
          title="Pokémon que aprenden el movimiento"
          description={
            move.learned_by_pokemon.length
              ? move.learned_by_pokemon.slice(0, 12).map((entry) => formatSlug(entry.name)).join(" · ")
              : "No hay datos disponibles."
          }
          className="bg-emerald-950/40"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
