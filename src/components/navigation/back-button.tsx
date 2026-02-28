"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = "Atrás" }: BackButtonProps) {
  const router = useRouter();

  return (
    <div className="flex">
      <Button type="button" variant="secondary" className="pixel-font" onClick={() => router.back()}>
        {label}
      </Button>
    </div>
  );
}
