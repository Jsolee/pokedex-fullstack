import Link from "next/link";

import { PaginationControls } from "@/components/pagination/pagination-controls";
import { SimpleSearch } from "@/components/search/simple-search";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocationList } from "@/server/location-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function LocationsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const page = Number(pageParam ?? 1) || 1;

  let data: Awaited<ReturnType<typeof getLocationList>> | null = null;
  let failed = false;

  try {
    data = await getLocationList(page, 20, queryParam?.toString());
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return (
      <DataState
        title="Error al cargar localizaciones"
        description="No pudimos obtener las localizaciones desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  if (data.items.length === 0) {
    return <DataState title="Sin localizaciones" description="No se encontraron localizaciones en la PokeAPI." />;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="pixel-font text-2xl text-primary">Localizaciones</h1>
        <p className="mt-2 text-sm text-emerald-200/80">
          Regiones y áreas disponibles dentro del mapa Pokémon.
        </p>
        <div className="mt-4">
          <SimpleSearch basePath="/locations" placeholder="Busca por nombre de localización" />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((location) => (
          <Link key={location.id} href={`/locations/${location.name}`} className="group">
            <Card className="border-emerald-900/40 bg-emerald-950/50 transition hover:border-emerald-400/70">
              <CardHeader className="space-y-2">
                <CardTitle className="pixel-font text-sm text-primary">{location.displayName}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">Región: {location.region ?? "-"}</Badge>
                  <Badge variant="secondary">Áreas: {location.areaCount}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-emerald-200/70">Explorar ubicación</CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {data.totalPages > 1 && !queryParam && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} basePath="/locations" />
        </div>
      )}
    </div>
  );
}
