const sparkles = ["✨", "⚡", "🌿"];

export function PokedexLoader({ message = "Cargando Pokédex" }: { message?: string }) {
  return (
    <div className="pokedex-loader-card relative overflow-hidden border border-emerald-900/60 bg-gradient-to-br from-emerald-950/80 via-emerald-900/30 to-emerald-950/70 px-6 py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-60" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex items-center gap-6">
          <div className="pokedex-loader__pokeball" aria-hidden>
            <span aria-hidden className="pokedex-loader__trail" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-100/70">Modo Scan</p>
            <p className="text-2xl font-black text-emerald-100 drop-shadow-[0_5px_15px_rgba(0,0,0,0.35)]">{message}</p>
            <p className="text-sm text-emerald-100/70">
              Afinando sensores para encontrar coincidencias perfectas. Mantén tus Pokébolas listas.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="pokedex-loader__bar" aria-hidden />
          <div className="flex items-center justify-between text-xs text-emerald-100/70">
            <span>Sincronizando regiones</span>
            <span className="font-semibold text-emerald-200">87%</span>
          </div>
          <div className="pokedex-loader__sparkles flex gap-3 text-2xl text-yellow-200">
            {sparkles.map((sparkle, index) => (
              <span key={sparkle + index}>{sparkle}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-emerald-900/40 bg-emerald-900/20 p-4 text-sm text-emerald-100/70">
        <p className="font-semibold text-emerald-100">Tip del Profesor Oak</p>
        <p>Los filtros combinados son más rápidos ahora: el nuevo índice se mantiene caliente en memoria.</p>
      </div>
    </div>
  );
}
