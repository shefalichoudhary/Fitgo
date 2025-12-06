import React, { useEffect, useMemo, useState } from "react";
import { InputField } from "@/components/InputField";

type SearchBarProps<T> = {
  data: T[];
  filterKey?: keyof T | (keyof T)[]; // <- optional, can be single key or array of keys
  onFilteredData: (filtered: T[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  debounceMs?: number;
};

export function SearchBar<T>({
  data,
  filterKey,
  onFilteredData,
  placeholder = "Search...",
  autoFocus = false,
  debounceMs = 150,
}: SearchBarProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // Determine keys to search
  const keysToFilter = useMemo(() => {
    if (!data || data.length === 0) return [] as (keyof T)[];
    if (Array.isArray(filterKey)) return filterKey;
    if (filterKey) return [filterKey] as (keyof T)[];
    // Auto-detect string/number fields from first item
    const sample = data[0] as Record<string, any>;
    return (Object.keys(sample) as (keyof T)[]).filter((k:any) => {
      const v = sample[k];
      return typeof v === "string" || typeof v === "number";
    });
  }, [data, filterKey]);

  // Compute filtered data (memoized)
  const rawFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      for (const key of keysToFilter) {
        const raw = (item as any)[key];
        if (raw === null || raw === undefined) continue;
        const str = String(raw).toLowerCase();
        if (str.includes(q)) return true;
      }
      return false;
    });
  }, [searchQuery, data, keysToFilter]);

  // Debounce notifying parent (so typing isn't expensive)
  useEffect(() => {
    const t = setTimeout(() => {
      onFilteredData(rawFiltered);
    }, debounceMs);

    return () => clearTimeout(t);
  }, [rawFiltered, onFilteredData, debounceMs]);

  return (
    <InputField
      placeholder={placeholder}
      value={searchQuery}
      onChangeText={setSearchQuery}
      leftIcon="search"
      keyboardType="default"
      secureTextEntry={false}
    />
  );
}
