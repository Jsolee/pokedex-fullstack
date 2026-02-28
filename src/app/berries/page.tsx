import Image from "next/image";
import Link from "next/link";

import { PaginationControls } from "@/components/pagination/pagination-controls";
import { ResourceFilterForm } from "@/components/search/resource-filter-form";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBerryFirmnessOptions, getBerryList, type BerryFilters } from "@/server/berry-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function BerriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const firmnessParam = Array.isArray(params.firmness) ? params.firmness[0] : params.firmness;
  const page = Number(pageParam ?? 1) || 1;
  const firmnessOptions = await getBerryFirmnessOptions();
  const filters = normalizeBerryFilters({ firmnessParam }, firmnessOptions);

  let data: Awaited<ReturnType<typeof getBerryList>> | null = null;
  let failed = false;

  try {
    data = await getBerryList(page, 20, queryParam?.toString(), filters);
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return (
      <DataState
        title="Error al cargar bayas"
        description="No pudimos obtener las bayas desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  if (data.items.length === 0) {
    return <DataState title="Sin bayas" description="No se encontraron bayas en la PokeAPI." />;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="pixel-font text-2xl text-primary">Bayas</h1>
        <p className="mt-2 text-sm text-emerald-200/80">
          Información esencial sobre crecimiento, firmeza y rendimiento de cada baya.
        </p>
        <div className="mt-4">
          <ResourceFilterForm
            basePath="/berries"
            placeholder="Busca por nombre de baya"
            initialQuery={queryParam?.toString() ?? ""}
            initialFilters={filters}
            fields={[
              {
                name: "firmness",
                label: "Firmeza",
                placeholder: "Todas",
                options: firmnessOptions,
              },
            ]}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((berry) => (
          <Link key={berry.id} href={`/berries/${berry.name}`} className="group">
            <Card className="border-emerald-900/40 bg-emerald-950/50 transition hover:border-emerald-400/70">
              <CardHeader className="space-y-2">
                  <div className="flex items-center gap-3">
                    {berry.spriteUrl && (
                      <Image src={berry.spriteUrl} alt={berry.displayName} width={32} height={32} />
                    )}
                    <CardTitle className="pixel-font text-sm text-primary">{berry.displayName}</CardTitle>
                  </div>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-200/80">
                  <Badge variant="secondary">Firmeza: {berry.firmness ?? "-"}</Badge>
                  <Badge variant="secondary">Tamaño: {berry.size}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-emerald-200/70">
                Tiempo crecimiento: {berry.growthTime} · Cosecha máx: {berry.maxHarvest}
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} basePath="/berries" />
        </div>
      )}
    </div>
  );
}

function normalizeBerryFilters(
  {
    firmnessParam,
  }: {
    firmnessParam?: string;
  },
  firmnessOptions: ReadonlyArray<{ value: string }>,
): BerryFilters {
  const firmness = firmnessOptions.find((option) => option.value === firmnessParam)?.value ?? null;
  return { firmness };
}
