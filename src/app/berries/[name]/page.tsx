import { notFound } from "next/navigation";

import Image from "next/image";

import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { formatSlug } from "@/lib/format";
import { getBerryDetail, getBerrySpriteUrl } from "@/server/berry-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ name: string }> | { name: string };
};

export default async function BerryDetailPage({ params }: PageProps) {
  const { name } = await params;

  try {
    const berry = await getBerryDetail(name);
    if (!berry) {
      notFound();
    }

    return (
      <div className="space-y-8">
        <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
          <p className="pixel-font text-xs text-emerald-300">Ficha de baya</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {berry.item?.name && (
              <Image
                src={getBerrySpriteUrl(berry.item.name)}
                alt={berry.name}
                width={48}
                height={48}
              />
            )}
            <h1 className="text-2xl font-black text-primary">{formatSlug(berry.name)}</h1>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">Firmeza: {berry.firmness?.name ?? "-"}</Badge>
            <Badge variant="secondary">Tamaño: {berry.size}</Badge>
            <Badge variant="secondary">Suavidad: {berry.smoothness}</Badge>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-emerald-900/40 bg-emerald-950/40 p-6 md:grid-cols-2">
          <div>
            <p className="pixel-font text-xs uppercase text-emerald-300">Crecimiento</p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-200/80">
              <li>Tiempo de crecimiento: {berry.growth_time}</li>
              <li>Máxima cosecha: {berry.max_harvest}</li>
              <li>Sequedad del suelo: {berry.soil_dryness}</li>
            </ul>
          </div>
          <div>
            <p className="pixel-font text-xs uppercase text-emerald-300">Efectos naturales</p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-200/80">
              <li>Regalo natural: {berry.natural_gift_power ?? "-"}</li>
              <li>Tipo regalo: {berry.natural_gift_type?.name ?? "-"}</li>
              <li>Item asociado: {berry.item?.name ?? "-"}</li>
            </ul>
          </div>
        </section>

        <DataState
          title="Sabores"
          description={
            berry.flavors.length
              ? berry.flavors
                  .map((flavor) => `${formatSlug(flavor.flavor.name)} (${flavor.potency})`)
                  .join(" · ")
              : "No hay sabores registrados para esta baya."
          }
          className="bg-emerald-950/40"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
