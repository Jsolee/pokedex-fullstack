"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SimpleSearchProps {
  placeholder: string;
  basePath: string;
  paramKey?: string;
}

export function SimpleSearch({ placeholder, basePath, paramKey = "query" }: SimpleSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get(paramKey) ?? "");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(paramKey, value.trim());
      params.delete("page");
    } else {
      params.delete(paramKey);
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const onReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);
    params.delete("page");
    setValue("");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="max-w-xs"
      />
      <Button type="submit" variant="secondary" className="pixel-font">
        Buscar
      </Button>
      <Button type="button" variant="ghost" className="pixel-font" onClick={onReset}>
        Limpiar
      </Button>
    </form>
  );
}
