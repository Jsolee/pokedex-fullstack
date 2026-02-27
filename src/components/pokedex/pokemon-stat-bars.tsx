import { PokemonApiResponse } from "@/lib/pokeapi";
import { formatStatName } from "@/lib/format";

export function PokemonStatBars({ stats }: { stats: PokemonApiResponse["stats"] }) {
  const MIN_STAT = 1;
  const MAX_STAT = 255;

  const clampStat = (value: number) => {
    if (Number.isNaN(value)) return MIN_STAT;
    return Math.min(MAX_STAT, Math.max(MIN_STAT, value));
  };

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const normalized = clampStat(stat.base_stat);
        const width = Math.round((normalized / MAX_STAT) * 100);
        return (
          <div key={stat.stat.name} className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase text-emerald-200/80">
              <span className="pixel-font">{formatStatName(stat.stat.name)}</span>
              <span>{stat.base_stat}</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-sm bg-emerald-950/60">
              <div
                className="stat-bar h-full bg-gradient-to-r from-emerald-400 to-lime-300"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
