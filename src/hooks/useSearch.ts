import { useState, useMemo } from 'react';

export function useSearch<T>(data: T[], searchKeys: (keyof T)[], initialTerm = '') {
  const [searchTerm, setSearchTerm] = useState(initialTerm);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }
    const lowerTerm = searchTerm.toLowerCase();

    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) {
          return false;
        }
        return String(val).toLowerCase().includes(lowerTerm);
      })
    );
  }, [data, searchTerm, JSON.stringify(searchKeys)]);

  return { searchTerm, setSearchTerm, filteredData };
}
