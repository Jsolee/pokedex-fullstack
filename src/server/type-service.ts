import { fetchAllTypes, PokemonTypeApiResponse } from "@/lib/pokeapi";
import { runPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

export type TypeEntry = {
  id: number;
  name: string;
  payload: PokemonTypeApiResponse;
};

type DbTypeRecord = Awaited<ReturnType<PrismaClient["type"]["findMany"]>>[number];
type JsonCompatible = Record<string, unknown>;

function mapDbRecord(typeRecord: DbTypeRecord): TypeEntry {
  return {
    id: typeRecord.id,
    name: typeRecord.name,
    payload: typeRecord.payload as unknown as PokemonTypeApiResponse,
  };
}

function mapApiType(typeData: PokemonTypeApiResponse): TypeEntry {
  return {
    id: typeData.id,
    name: typeData.name,
    payload: typeData,
  };
}

async function safeFetchTypesFromDb(): Promise<DbTypeRecord[] | null> {
  return runPrisma((client) => client.type.findMany({ orderBy: { name: "asc" } }));
}

async function safePersistTypes(freshTypes: PokemonTypeApiResponse[]) {
  await runPrisma((client) =>
    client.$transaction(
      freshTypes.map((typeData) => {
        const payload = typeData as unknown as JsonCompatible;
        return client.type.upsert({
          where: { name: typeData.name },
          update: { payload: payload as unknown as never },
          create: { name: typeData.name, payload: payload as unknown as never },
        });
      }),
    ),
  );
}

export async function getTypeEntries(): Promise<TypeEntry[]> {
  const existing = await safeFetchTypesFromDb();
  if (existing && existing.length > 0) {
    return existing.map(mapDbRecord);
  }

  const freshTypes = await fetchAllTypes();
  await safePersistTypes(freshTypes);
  return freshTypes.map(mapApiType);
}
