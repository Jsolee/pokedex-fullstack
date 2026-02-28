"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  basePath?: string;
  paramKey?: string;
}

export function PaginationControls({ page, totalPages, basePath = "/", paramKey = "page" }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, String(nextPage));
    router.push(`${basePath}?${params.toString()}`);
  };

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="secondary"
        className="pixel-font"
        disabled={!canGoPrev}
        onClick={() => canGoPrev && goToPage(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
      </Button>
      <p className="pixel-font text-xs text-emerald-200">
        Página {page} / {totalPages || 1}
      </p>
      <Button
        variant="secondary"
        className="pixel-font"
        disabled={!canGoNext}
        onClick={() => canGoNext && goToPage(page + 1)}
      >
        Siguiente <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
