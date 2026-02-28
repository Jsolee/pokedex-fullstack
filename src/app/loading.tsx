export default function LoadingHome() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950/95 via-slate-950/90 to-emerald-900/90 text-emerald-50 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(74,222,128,0.22),transparent_42%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(94,234,212,0.14),transparent_40%)]" aria-hidden />

      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        <div className="pokedex-loader__pokeball" aria-hidden>
          <span aria-hidden className="pokedex-loader__trail" />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-100/70">Sincronizando Pokédex</p>
          <h1 className="text-3xl font-black leading-tight text-emerald-50 drop-shadow-[0_8px_25px_rgba(0,0,0,0.35)]">
            Cargando Pokédex
          </h1>
          <p className="max-w-xl text-sm text-emerald-100/80">
            Preparando el índice y los sprites iniciales. Mantén tus Pokébolas listas: esto solo tarda un instante.
          </p>
        </div>

        <div className="w-56 max-w-xs space-y-2">
          <div className="pokedex-loader__bar" aria-hidden />
          <p className="text-xs text-emerald-100/70">Afinando sensores para que la Pokédex abra lista.</p>
        </div>
      </div>
    </div>
  );
}
