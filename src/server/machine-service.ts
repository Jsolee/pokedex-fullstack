import { formatSlug } from "@/lib/format";
import {
  fetchAllMachineListing,
  fetchMachineById,
  fetchMachineListing,
  fetchVersionGroupListing,
} from "@/lib/pokeapi";

export type MachineTypeItem = {
  name: string;
  displayName: string;
  description: string;
  totalItems: number;
  exampleItem: string | null;
};

export type MachineTypePayload = {
  items: MachineTypeItem[];
  total: number;
};

export type MachineListItem = {
  id: number;
  itemName: string;
  displayName: string;
  type: "tm" | "hm" | "tr" | null;
  moveName: string | null;
  versionGroup: string | null;
};

export type MachineListPayload = {
  items: MachineListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MachineFilters = {
  type: "tm" | "hm" | "tr" | null;
  versionGroup: string | null;
};

const MACHINE_TYPE_LABELS: Record<NonNullable<MachineFilters["type"]>, string> = {
  tm: "TM",
  hm: "HM",
  tr: "TR",
};

const MACHINE_TYPE_PREFIXES = ["tm", "hm", "tr"] as const;

let machineListCache:
  | {
      updatedAt: number;
      data: MachineListItem[];
    }
  | null = null;

const MACHINE_CACHE_TTL = 1000 * 60 * 30;
const MACHINE_FETCH_BATCH = 40;

function detectMachineType(itemName: string | null): MachineFilters["type"] {
  if (!itemName) return null;
  const lower = itemName.toLowerCase();
  const match = MACHINE_TYPE_PREFIXES.find((prefix) => lower.startsWith(prefix));
  return match ?? null;
}

async function loadAllMachines(): Promise<MachineListItem[]> {
  const listing = await fetchAllMachineListing();
  const ids = listing.results
    .map((entry) => entry.url.match(/\/(\d+)\/?$/))
    .map((match) => (match ? Number(match[1]) : null))
    .filter((id): id is number => Boolean(id));

  const items: MachineListItem[] = [];
  for (let i = 0; i < ids.length; i += MACHINE_FETCH_BATCH) {
    const chunk = ids.slice(i, i + MACHINE_FETCH_BATCH);
    const chunkResults = await Promise.all(
      chunk.map(async (id) => {
        try {
          const machine = await fetchMachineById(id);
          const type = detectMachineType(machine.item?.name ?? null);
          return {
            id: machine.id,
            itemName: machine.item?.name ?? "",
            displayName: machine.item?.name ? formatSlug(machine.item.name) : `Máquina ${machine.id}`,
            type,
            moveName: machine.move?.name ? formatSlug(machine.move.name) : null,
            versionGroup: machine.version_group?.name ? formatSlug(machine.version_group.name) : null,
          };
        } catch {
          return null;
        }
      }),
    );

    chunkResults.forEach((entry) => {
      if (entry) items.push(entry);
    });
  }

  return items.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getMachineList(
  page = 1,
  pageSize = 20,
  query?: string,
  filters?: MachineFilters,
): Promise<MachineListPayload> {
  const normalizedQuery = query?.trim().toLowerCase();
  const hasFilters = Boolean(filters?.type || filters?.versionGroup || normalizedQuery);

  if (!hasFilters) {
    const listing = await fetchMachineListing(page, pageSize);
    const ids = listing.results
      .map((entry) => entry.url.match(/\/(\d+)\/?$/))
      .map((match) => (match ? Number(match[1]) : null))
      .filter((id): id is number => Boolean(id));

    const items = await Promise.all(
      ids.map(async (id) => {
        try {
          const machine = await fetchMachineById(id);
          const type = detectMachineType(machine.item?.name ?? null);
          return {
            id: machine.id,
            itemName: machine.item?.name ?? "",
            displayName: machine.item?.name ? formatSlug(machine.item.name) : `Máquina ${machine.id}`,
            type,
            moveName: machine.move?.name ? formatSlug(machine.move.name) : null,
            versionGroup: machine.version_group?.name ? formatSlug(machine.version_group.name) : null,
          };
        } catch {
          return null;
        }
      }),
    );

    const total = listing.count;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: items.filter(Boolean) as MachineListItem[],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  if (!machineListCache || Date.now() - machineListCache.updatedAt > MACHINE_CACHE_TTL) {
    const data = await loadAllMachines();
    machineListCache = {
      updatedAt: Date.now(),
      data,
    };
  }

  const filtered = machineListCache.data.filter((machine) => {
    if (filters?.type && machine.type !== filters.type) return false;
    if (filters?.versionGroup && machine.versionGroup?.toLowerCase() !== filters.versionGroup) return false;
    if (!normalizedQuery) return true;
    if (Number.isFinite(Number(normalizedQuery)) && Number(normalizedQuery) === machine.id) return true;
    return (
      machine.displayName.toLowerCase().includes(normalizedQuery) ||
      (machine.moveName?.toLowerCase().includes(normalizedQuery) ?? false) ||
      (machine.versionGroup?.toLowerCase().includes(normalizedQuery) ?? false)
    );
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.max(0, (page - 1) * pageSize);
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function getMachineTypeOptions() {
  return MACHINE_TYPE_PREFIXES.map((prefix) => ({
    value: prefix,
    label: MACHINE_TYPE_LABELS[prefix],
  }));
}

export async function getVersionGroupOptions() {
  const listing = await fetchVersionGroupListing(1, 100);
  return listing.results
    .map((entry) => ({ value: entry.name, label: formatSlug(entry.name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getMachineDetail(id: number) {
  return fetchMachineById(id);
}
