"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type FilterOption = { value: string; label: string };

export type FilterField = {
  name: string;
  label: string;
  placeholder: string;
  options: ReadonlyArray<FilterOption>;
};

type FilterState = Record<string, string | null>;

interface ResourceFilterFormProps {
  basePath: string;
  placeholder: string;
  initialQuery?: string;
  initialFilters?: FilterState;
  fields: ReadonlyArray<FilterField>;
  queryParamKey?: string;
}

export function ResourceFilterForm({
  basePath,
  placeholder,
  initialQuery = "",
  initialFilters = {},
  fields,
  queryParamKey = "query",
}: ResourceFilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const defaultFilters = useMemo<FilterState>(
    () =>
      fields.reduce<FilterState>((acc, field) => {
        acc[field.name] = null;
        return acc;
      }, {}),
    [fields],
  );

  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, ...initialFilters });

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setFilters({ ...defaultFilters, ...initialFilters });
  }, [defaultFilters, initialFilters]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set(queryParamKey, value.trim().toLowerCase());
      params.delete("page");
    } else {
      params.delete(queryParamKey);
    }

    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        params.set(key, filterValue);
        params.delete("page");
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setValue("");
    setFilters({ ...defaultFilters });

    const params = new URLSearchParams(searchParams.toString());
    params.delete(queryParamKey);
    params.delete("page");
    fields.forEach((field) => params.delete(field.name));

    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const hasActiveFilters = Boolean(
    value || Object.values(filters).some((filterValue) => Boolean(filterValue)),
  );

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
        {hasActiveFilters && (
          <Button type="button" variant="secondary" className="pixel-font" onClick={handleClear} disabled={isPending}>
            Limpiar
          </Button>
        )}
      </div>
      {fields.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => (
            <label
              key={field.name}
              className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300"
            >
              {field.label}
              <select
                className="pixel-border h-10 rounded-md bg-emerald-950/40 px-3 text-emerald-50"
                value={filters[field.name] ?? ""}
                disabled={isPending}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, [field.name]: event.target.value || null }))
                }
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
    </form>
  );
}
