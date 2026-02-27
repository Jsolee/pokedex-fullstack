"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="pixel-font text-xl text-primary">Algo salió mal</p>
      <p className="text-sm text-emerald-100/80">
        No pudimos cargar los datos. Intenta recargar la página para repetir la solicitud.
      </p>
      <Button onClick={reset} className="pixel-font">
        Reintentar
      </Button>
    </div>
  );
}
