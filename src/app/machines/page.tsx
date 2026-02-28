import { PaginationControls } from "@/components/pagination/pagination-controls";
import { ResourceFilterForm } from "@/components/search/resource-filter-form";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMachineList,
  getMachineTypeOptions,
  getVersionGroupOptions,
  type MachineFilters,
} from "@/server/machine-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function MachinesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const versionGroupParam = Array.isArray(params.versionGroup) ? params.versionGroup[0] : params.versionGroup;
  const page = Number(pageParam ?? 1) || 1;
  const typeOptions = getMachineTypeOptions();
  const versionGroupOptions = await getVersionGroupOptions();
  const filters = normalizeMachineFilters({ typeParam, versionGroupParam }, typeOptions, versionGroupOptions);

  let data: Awaited<ReturnType<typeof getMachineList>> | null = null;
  let failed = false;

  try {
    data = await getMachineList(page, 20, queryParam?.toString(), filters);
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return (
      <DataState
        title="Error al cargar máquinas"
        description="No pudimos obtener las máquinas desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  if (data.items.length === 0) {
    return <DataState title="Sin máquinas" description="No se encontraron máquinas en la PokeAPI." />;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="pixel-font text-2xl text-primary">Máquinas</h1>
        <p className="mt-2 text-sm text-emerald-200/80">
          Máquinas técnicas (TM), ocultas (HM) y registros técnicos (TR) disponibles en los juegos.
        </p>
        <div className="mt-4">
          <ResourceFilterForm
            basePath="/machines"
            placeholder="Busca por máquina o movimiento"
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
                name: "versionGroup",
                label: "Grupo versión",
                placeholder: "Todos",
                options: versionGroupOptions,
              },
            ]}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((machine) => (
          <Card key={machine.id} className="border-emerald-900/40 bg-emerald-950/50">
            <CardHeader className="space-y-2">
              <CardTitle className="pixel-font text-sm text-primary">{machine.displayName}</CardTitle>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">ID: {machine.id}</Badge>
                <Badge variant="secondary">Tipo: {machine.type?.toUpperCase() ?? "-"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-200/70">
              <p>Movimiento: {machine.moveName ?? "-"}</p>
              <p>Grupo versión: {machine.versionGroup ?? "-"}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} basePath="/machines" />
        </div>
      )}
    </div>
  );
}

function normalizeMachineFilters(
  {
    typeParam,
    versionGroupParam,
  }: {
    typeParam?: string;
    versionGroupParam?: string;
  },
  typeOptions: ReadonlyArray<{ value: string }>,
  versionGroupOptions: ReadonlyArray<{ value: string }>,
): MachineFilters {
  const type = typeOptions.find((option) => option.value === typeParam)?.value ?? null;
  const versionGroup =
    versionGroupOptions.find((option) => option.value === versionGroupParam)?.value ?? null;
  return {
    type: type as MachineFilters["type"],
    versionGroup,
  };
}
