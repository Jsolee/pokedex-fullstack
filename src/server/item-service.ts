import { formatSlug } from "@/lib/format";
import {
  fetchItemByName,
  fetchItemCategoryByName,
  fetchItemCategoryListing,
  fetchItemListing,
  ItemApiResponse,
} from "@/lib/pokeapi";

export type ItemListItem = {
  id: number;
  name: string;
  displayName: string;
  cost: number;
  category: string | null;
  sprite: string | null;
};

export type ItemListPayload = {
  items: ItemListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ItemFilters = {
  category: string | null;
};

export type ItemCategoryOption = {
  value: string;
  label: string;
};

function extractId(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function mapItemToListItem(item: ItemApiResponse): ItemListItem {
  return {
    id: item.id,
    name: item.name,
    displayName: formatSlug(item.name),
    cost: item.cost,
    category: item.category?.name ? formatSlug(item.category.name) : null,
    sprite: item.sprites?.default ?? null,
  };
}

export async function getItemList(
  page = 1,
  pageSize = 20,
  query?: string,
  filters?: ItemFilters,
): Promise<ItemListPayload> {
  const sanitized = query?.trim().toLowerCase();
  const category = filters?.category?.trim().toLowerCase() ?? null;
  if (sanitized) {
    try {
      const item = await fetchItemByName(sanitized);
      if (category && item.category?.name !== category) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 1,
          totalPages: 1,
        };
      }
      const entry = mapItemToListItem(item);
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

  if (category) {
    const categoryData = await fetchItemCategoryByName(category);
    const names = categoryData.items.map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
    const total = names.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = Math.max(0, (page - 1) * pageSize);
    const pageNames = names.slice(start, start + pageSize);
    const items = await Promise.all(
      pageNames.map(async (name) => {
        try {
          const item = await fetchItemByName(name);
          return mapItemToListItem(item);
        } catch {
          return {
            id: 0,
            name,
            displayName: formatSlug(name),
            cost: 0,
            category: formatSlug(category),
            sprite: null,
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

  const listing = await fetchItemListing(page, pageSize);
  const items = await Promise.all(
    listing.results.map(async (result) => {
      try {
        const item = await fetchItemByName(result.name);
        return mapItemToListItem(item);
      } catch {
        return {
          id: extractId(result.url) ?? 0,
          name: result.name,
          displayName: formatSlug(result.name),
          cost: 0,
          category: null,
          sprite: null,
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

export async function getItemCategoryOptions(): Promise<ItemCategoryOption[]> {
  const listing = await fetchItemCategoryListing(1, 200);
  const options = listing.results.map((entry) => ({
    value: entry.name,
    label: formatSlug(entry.name),
  }));
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export async function getItemDetail(name: string) {
  return fetchItemByName(name);
}
