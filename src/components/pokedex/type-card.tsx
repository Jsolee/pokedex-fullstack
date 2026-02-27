import { TypeEntry } from "@/server/type-service";
import { PokemonTypePill } from "./pokemon-type-pill";

export function TypeCard({ entry }: { entry: TypeEntry }) {
  const relations = entry.payload.damage_relations;
  const featuredPokemon = entry.payload.pokemon.slice(0, 3);

  const formatName = (value: string) =>
    value
      .split("-")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");

  const formatRelation = (key: keyof typeof relations) =>
    relations[key]
      ?.map((item) => formatName(item.name))
      .join(", ") || "—";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/60 p-4">
      <div className="flex items-center justify-between">
        <PokemonTypePill typeName={entry.name} />
        <span className="text-[10px] uppercase text-emerald-200/70">#{entry.id}</span>
      </div>
      <div className="grid gap-3 text-xs text-emerald-100/90">
        <div>
          <p className="pixel-font text-[10px] uppercase text-emerald-300">Doble daño a</p>
          <p>{formatRelation("double_damage_to")}</p>
        </div>
        <div>
          <p className="pixel-font text-[10px] uppercase text-emerald-300">Doble daño de</p>
          <p>{formatRelation("double_damage_from")}</p>
        </div>
      </div>
      <div>
        <p className="pixel-font text-[10px] uppercase text-emerald-300">Pokémon destacados</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] capitalize text-emerald-100">
          {featuredPokemon.map((item) => (
            <span key={item.pokemon.name} className="rounded-sm bg-emerald-900/40 px-2 py-0.5">
              {formatName(item.pokemon.name)}
            </span>
          ))}
          {featuredPokemon.length === 0 && <span className="text-emerald-300/60">Sin datos</span>}
        </div>
      </div>
    </article>
  );
}
