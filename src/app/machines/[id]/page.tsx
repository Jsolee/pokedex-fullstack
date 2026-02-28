import { notFound } from "next/navigation";

import { BackButton } from "@/components/navigation/back-button";
import { DataState } from "@/components/state/data-state";
import { Badge } from "@/components/ui/badge";
import { formatSlug } from "@/lib/format";
import { getMachineDetail } from "@/server/machine-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function MachineDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!numericId) {
    notFound();
  }

  try {
    const machine = await getMachineDetail(numericId);
    if (!machine) {
      notFound();
    }

    return (
      <div className="space-y-8">
        <BackButton />
        <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6">
          <p className="pixel-font text-xs text-emerald-300">Máquina</p>
          <h1 className="mt-3 text-2xl font-black text-primary">Máquina #{machine.id}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">
              Movimiento: {machine.move?.name ? formatSlug(machine.move.name) : "-"}
            </Badge>
            <Badge variant="secondary">
              Grupo versión: {machine.version_group?.name ? formatSlug(machine.version_group.name) : "-"}
            </Badge>
          </div>
        </header>

        <DataState
          title="Resumen"
          description={`Movimiento: ${machine.move?.name ? formatSlug(machine.move.name) : "-"}`}
          className="bg-emerald-950/40"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
