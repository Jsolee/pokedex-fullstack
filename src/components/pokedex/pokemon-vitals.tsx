import { PokemonApiResponse } from "@/lib/pokeapi";
import { toKilograms, toMeters } from "@/lib/format";

export function PokemonVitals({ pokemon }: { pokemon: PokemonApiResponse }) {
  const capitalize = (value: string) =>
    value
      .split("-")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");

  const metrics = [
    {
      label: "Altura",
      value: `${toMeters(pokemon.height)} m`,
    },
    {
      label: "Peso",
      value: `${toKilograms(pokemon.weight)} kg`,
    },
    {
      label: "Habilidades",
      value: pokemon.abilities.map((ab) => capitalize(ab.ability.name)).join(", "),
    },
  ];

  return (
    <div className="grid gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-emerald-700/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100"
        >
          <p className="pixel-font text-[10px] uppercase text-emerald-300/70">
            {metric.label}
          </p>
          <p className="mt-1 text-sm">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
