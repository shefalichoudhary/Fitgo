import React, { useEffect, useMemo, useState } from "react";
import { InputField } from "@/components/InputField";

type SearchBarProps<T> = {
  data: T[];
  filterKey: keyof T;
  onFilteredData: (filtered: T[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar<T>({
  data,
  filterKey,
  onFilteredData,
  placeholder = "Search...",
  autoFocus = false,
}: SearchBarProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Use useMemo for efficient filtering (avoids re-filtering unless needed)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter((item) => {
      const value = String(item[filterKey] ?? "").toLowerCase();
      return value.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, data, filterKey]);

  // ✅ Send filtered data to parent only when it changes
  useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData]);

  return (
    <InputField
      placeholder={placeholder}
      value={searchQuery}
      onChangeText={setSearchQuery}
      leftIcon="search" // 👈 shows search icon
      keyboardType="default"
      secureTextEntry={false}
    />
  );
}
