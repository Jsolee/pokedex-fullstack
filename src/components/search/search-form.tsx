"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PokemonFilters } from "@/server/pokemon-service";

interface SearchFormProps {
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: PokemonFilters;
  typeOptions: ReadonlyArray<{ value: string; label: string }>;
  generationOptions: ReadonlyArray<{ value: string; label: string }>;
  evolutionOptions: ReadonlyArray<{ value: string; label: string }>;
  legendaryOptions: ReadonlyArray<{ value: string; label: string }>;
}

const defaultFilters: PokemonFilters = {
  type: null,
  generation: null,
  evolution: null,
  legendary: null,
};

export function SearchForm({
  placeholder = "Search Pokémon",
  initialQuery = "",
  initialFilters = defaultFilters,
  typeOptions,
  generationOptions,
  evolutionOptions,
  legendaryOptions,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [filters, setFilters] = useState<PokemonFilters>({ ...defaultFilters, ...initialFilters });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setFilters({ ...defaultFilters, ...initialFilters });
  }, [initialFilters]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("query", value.toLowerCase());
      params.delete("page");
    } else {
      params.delete("query");
    }

    (Object.entries(filters) as Array<[keyof PokemonFilters, string | null]>).forEach(([key, filterValue]) => {
      if (filterValue) {
        params.set(key, filterValue);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setValue("");
  setFilters({ ...defaultFilters });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    params.delete("type");
    params.delete("generation");
    params.delete("evolution");
    params.delete("legendary");
    params.delete("page");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const renderSelect = (
    label: string,
    name: keyof PokemonFilters,
    options: ReadonlyArray<{ value: string; label: string }>,
    placeholderOption: string,
  ) => {
    const value = filters[name] ?? "";
    return (
      <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
        {label}
        <select
          className="pixel-border h-10 rounded-md bg-emerald-950/40 px-3 text-emerald-50"
          value={value}
          disabled={isPending}
          onChange={(event) => setFilters((prev) => ({ ...prev, [name]: event.target.value || null }))}
        >
          <option value="">{placeholderOption}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="pixel-border h-11 flex-1 bg-emerald-950/40 text-emerald-50 placeholder:text-emerald-300/40"
        />
        <Button type="submit" className="pixel-font bg-primary text-primary-foreground" disabled={isPending}>
          Buscar / Filtrar
        </Button>
        {(value || filters.type || filters.generation || filters.evolution || filters.legendary) && (
          <Button
            type="button"
            variant="secondary"
            className="pixel-font"
            onClick={handleClear}
            disabled={isPending}
          >
            Limpiar
          </Button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {renderSelect("Tipo", "type", typeOptions, "Todos")}
        {renderSelect("Generación", "generation", generationOptions, "Todas")}
        {renderSelect("Evolución", "evolution", evolutionOptions, "Cualquiera")}
        {renderSelect("Rareza", "legendary", legendaryOptions, "Todas")}
      </div>
      {isPending && (
        <div className="pixel-border flex items-center gap-3 rounded-2xl border-emerald-800/70 bg-emerald-950/70 px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="pokedex-loader__pokeball pokedex-loader__pokeball--mini" aria-hidden />
          </div>
          <div>
            <p className="pixel-font text-[10px] uppercase tracking-[0.35em] text-emerald-200">Loading...</p>
            <p className="text-xs text-emerald-100/80">Calculando filtros de la Pokédex</p>
          </div>
        </div>
      )}
    </form>
  );
}
