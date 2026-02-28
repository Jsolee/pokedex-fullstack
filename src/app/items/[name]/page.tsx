import Image from "next/image";
import { notFound } from "next/navigation";

import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { formatSlug } from "@/lib/format";
import { getItemDetail } from "@/server/item-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ name: string }> | { name: string };
};

export default async function ItemDetailPage({ params }: PageProps) {
  const { name } = await params;

  try {
    const item = await getItemDetail(name);
    if (!item) {
      notFound();
    }

    const effect =
      item.effect_entries.find((entry) => entry.language.name === "es")?.short_effect ??
      item.effect_entries.find((entry) => entry.language.name === "en")?.short_effect ??
      "Sin efecto disponible.";

    const flavor =
      item.flavor_text_entries.find((entry) => entry.language.name === "es")?.text ??
      item.flavor_text_entries.find((entry) => entry.language.name === "en")?.text ??
      "Sin descripción disponible.";

    return (
      <div className="space-y-8">
        <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
          <div className="flex flex-wrap items-center gap-4">
            {item.sprites?.default && (
              <Image src={item.sprites.default} alt={item.name} width={64} height={64} />
            )}
            <div>
              <p className="pixel-font text-xs text-emerald-300">Ítem</p>
              <h1 className="mt-2 text-2xl font-black text-primary">{formatSlug(item.name)}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Costo: {item.cost}</Badge>
                <Badge variant="secondary">{item.category?.name ? formatSlug(item.category.name) : "Sin categoría"}</Badge>
              </div>
            </div>
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
          title="Atributos"
          description={
            item.attributes.length
              ? item.attributes.map((entry) => formatSlug(entry.name)).join(" · ")
              : "No hay atributos registrados para este ítem."
          }
          className="bg-emerald-950/40"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
