import { notFound } from "next/navigation";

import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { formatSlug } from "@/lib/format";
import { getLocationDetail } from "@/server/location-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ name: string }> | { name: string };
};

export default async function LocationDetailPage({ params }: PageProps) {
  const { name } = await params;

  try {
    const location = await getLocationDetail(name);
    if (!location) {
      notFound();
    }

    return (
      <div className="space-y-8">
        <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
          <p className="pixel-font text-xs text-emerald-300">Localización</p>
          <h1 className="mt-3 text-2xl font-black text-primary">{formatSlug(location.name)}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">Región: {location.region?.name ?? "-"}</Badge>
            <Badge variant="secondary">Áreas: {location.areas.length}</Badge>
          </div>
        </header>

        <DataState
          title="Áreas"
          description={
            location.areas.length
              ? location.areas.map((area) => formatSlug(area.name)).join(" · ")
              : "No hay áreas listadas para esta localización."
          }
          className="bg-emerald-950/40"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
