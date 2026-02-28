import Link from "next/link";

import { PaginationControls } from "@/components/pagination/pagination-controls";
import { ResourceFilterForm } from "@/components/search/resource-filter-form";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POKEMON_TYPE_OPTIONS } from "@/lib/constants";
import { formatSlug } from "@/lib/format";
import { getMoveDamageClassOptions, getMoveList, type MoveFilters } from "@/server/move-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function MovesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const damageClassParam = Array.isArray(params.damageClass) ? params.damageClass[0] : params.damageClass;
  const page = Number(pageParam ?? 1) || 1;
  const damageClassOptions = await getMoveDamageClassOptions();
  const typeOptions = POKEMON_TYPE_OPTIONS.map((type) => ({
    value: type,
    label: type.replace(/\b\w/g, (char) => char.toUpperCase()),
  }));
  const filters = normalizeMoveFilters({ typeParam, damageClassParam }, { typeOptions, damageClassOptions });

  let data: Awaited<ReturnType<typeof getMoveList>> | null = null;
  let failed = false;

  try {
    data = await getMoveList(page, 20, queryParam?.toString(), filters);
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return (
      <DataState
        title="Error al cargar movimientos"
        description="No pudimos obtener los movimientos desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  if (data.items.length === 0) {
    return <DataState title="Sin movimientos" description="No se encontraron movimientos en la PokeAPI." />;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="pixel-font text-2xl text-primary">Movimientos</h1>
        <p className="mt-2 text-sm text-emerald-200/80">
          Poder, precisión y tipo de los movimientos disponibles.
        </p>
        <div className="mt-4">
          <ResourceFilterForm
            basePath="/moves"
            placeholder="Busca por nombre de movimiento"
            initialQuery={queryParam?.toString() ?? ""}
            initialFilters={filters}
            fields={[
              {
                name: "type",
                label: "Tipo",
                placeholder: "Todos",
                options: typeOptions,
              },
              {
                name: "damageClass",
                label: "Clase de daño",
                placeholder: "Todas",
                options: damageClassOptions,
              },
            ]}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((move) => (
          <Link key={move.id} href={`/moves/${move.name}`} className="group">
            <Card className="border-emerald-900/40 bg-emerald-950/50 transition hover:border-emerald-400/70">
              <CardHeader className="space-y-2">
                <CardTitle className="pixel-font text-sm text-primary">{move.displayName}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">Tipo: {move.type ? formatSlug(move.type) : "-"}</Badge>
                  <Badge variant="secondary">PP: {move.pp ?? "-"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-emerald-200/70">
                Poder: {move.power ?? "-"} · Precisión: {move.accuracy ?? "-"}
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} basePath="/moves" />
        </div>
      )}
    </div>
  );
}

function normalizeMoveFilters(
  {
    typeParam,
    damageClassParam,
  }: {
    typeParam?: string;
    damageClassParam?: string;
  },
  {
    typeOptions,
    damageClassOptions,
  }: {
    typeOptions: ReadonlyArray<{ value: string }>;
    damageClassOptions: ReadonlyArray<{ value: string }>;
  },
): MoveFilters {
  const type = typeOptions.find((option) => option.value === typeParam)?.value ?? null;
  const damageClass = damageClassOptions.find((option) => option.value === damageClassParam)?.value ?? null;
  return { type, damageClass };
}
