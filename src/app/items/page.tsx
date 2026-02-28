import Image from "next/image";
import Link from "next/link";

import { PaginationControls } from "@/components/pagination/pagination-controls";
import { ResourceFilterForm } from "@/components/search/resource-filter-form";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getItemCategoryOptions, getItemList, type ItemFilters } from "@/server/item-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function ItemsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const page = Number(pageParam ?? 1) || 1;
  const categoryOptions = await getItemCategoryOptions();
  const filters = normalizeItemFilters({ categoryParam }, categoryOptions);

  let data: Awaited<ReturnType<typeof getItemList>> | null = null;
  let failed = false;

  try {
    data = await getItemList(page, 20, queryParam?.toString(), filters);
  } catch {
    failed = true;
  }

  if (failed || !data) {
    return (
      <DataState
        title="Error al cargar ítems"
        description="No pudimos obtener los ítems desde la PokeAPI. Intenta de nuevo en unos segundos."
      />
    );
  }

  if (data.items.length === 0) {
    return <DataState title="Sin ítems" description="No se encontraron ítems en la PokeAPI." />;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
        <h1 className="pixel-font text-2xl text-primary">Ítems</h1>
        <p className="mt-2 text-sm text-emerald-200/80">
          Descripciones y categorías de objetos clave del mundo Pokémon.
        </p>
        <div className="mt-4">
          <ResourceFilterForm
            basePath="/items"
            placeholder="Busca por nombre de ítem"
            initialQuery={queryParam?.toString() ?? ""}
            initialFilters={filters}
            fields={[
              {
                name: "category",
                label: "Categoría",
                placeholder: "Todas",
                options: categoryOptions,
              },
            ]}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <Link key={item.id} href={`/items/${item.name}`} className="group">
            <Card className="border-emerald-900/40 bg-emerald-950/50 transition hover:border-emerald-400/70">
              <CardHeader className="space-y-2">
                <CardTitle className="pixel-font text-sm text-primary">{item.displayName}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-200/80">
                  <Badge variant="secondary">Costo: {item.cost}</Badge>
                  <Badge variant="secondary">{item.category ?? "Sin categoría"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-3 text-sm text-emerald-200/70">
                {item.sprite && (
                  <Image src={item.sprite} alt={item.displayName} width={40} height={40} />
                )}
                <span>Ver detalle completo</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} basePath="/items" />
        </div>
      )}
    </div>
  );
}

function normalizeItemFilters(
  {
    categoryParam,
  }: {
    categoryParam?: string;
  },
  categoryOptions: ReadonlyArray<{ value: string }>,
): ItemFilters {
  const category = categoryOptions.find((option) => option.value === categoryParam)?.value ?? null;
  return { category };
}
