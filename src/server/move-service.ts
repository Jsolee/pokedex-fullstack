import { formatSlug } from "@/lib/format";
import {
  fetchMoveByName,
  fetchMoveDamageClassByName,
  fetchMoveDamageClassListing,
  fetchMoveListing,
  fetchTypeWithMoves,
  MoveApiResponse,
} from "@/lib/pokeapi";

export type MoveListItem = {
  id: number;
  name: string;
  displayName: string;
  type: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
};

export type MoveListPayload = {
  items: MoveListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MoveFilters = {
  type: string | null;
  damageClass: string | null;
};

export type MoveDamageClassOption = {
  value: string;
  label: string;
};

function extractId(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function mapMoveToListItem(move: MoveApiResponse): MoveListItem {
  return {
    id: move.id,
    name: move.name,
    displayName: formatSlug(move.name),
    type: move.type?.name ?? null,
    power: move.power ?? null,
    accuracy: move.accuracy ?? null,
    pp: move.pp ?? null,
  };
}

export async function getMoveList(
  page = 1,
  pageSize = 20,
  query?: string,
  filters?: MoveFilters,
): Promise<MoveListPayload> {
  const sanitized = query?.trim().toLowerCase();
  const type = filters?.type?.trim().toLowerCase() ?? null;
  const damageClass = filters?.damageClass?.trim().toLowerCase() ?? null;
  if (sanitized) {
    try {
      const move = await fetchMoveByName(sanitized);
      if (type && move.type?.name !== type) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 1,
          totalPages: 1,
        };
      }
      if (damageClass && move.damage_class?.name !== damageClass) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 1,
          totalPages: 1,
        };
      }
      const entry = mapMoveToListItem(move);
      return {
        items: [entry],
        total: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };
    }
  }

  if (type || damageClass) {
    let names: string[] | null = null;
    if (type) {
      const typeData = await fetchTypeWithMoves(type);
      names = typeData.moves.map((entry) => entry.name);
    }
    if (damageClass) {
      const classData = await fetchMoveDamageClassByName(damageClass);
      const classNames = classData.moves.map((entry) => entry.name);
      names = names ? names.filter((name) => classNames.includes(name)) : classNames;
    }

    const sortedNames = (names ?? []).sort((a, b) => a.localeCompare(b));
    const total = sortedNames.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = Math.max(0, (page - 1) * pageSize);
    const pageNames = sortedNames.slice(start, start + pageSize);
    const items = await Promise.all(
      pageNames.map(async (name) => {
        try {
          const move = await fetchMoveByName(name);
          return mapMoveToListItem(move);
        } catch {
          return {
            id: 0,
            name,
            displayName: formatSlug(name),
            type: type,
            power: null,
            accuracy: null,
            pp: null,
          };
        }
      }),
    );

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const listing = await fetchMoveListing(page, pageSize);
  const items = await Promise.all(
    listing.results.map(async (result) => {
      try {
        const move = await fetchMoveByName(result.name);
        return mapMoveToListItem(move);
      } catch {
        return {
          id: extractId(result.url) ?? 0,
          name: result.name,
          displayName: formatSlug(result.name),
          type: null,
          power: null,
          accuracy: null,
          pp: null,
        };
      }
    }),
  );

  const total = listing.count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getMoveDamageClassOptions(): Promise<MoveDamageClassOption[]> {
  const listing = await fetchMoveDamageClassListing(1, 100);
  const options = listing.results.map((entry) => ({
    value: entry.name,
    label: formatSlug(entry.name),
  }));
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export async function getMoveDetail(name: string) {
  return fetchMoveByName(name);
}
