import { useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialSize?: number;
}

export function usePagination({ initialPage = 1, initialSize = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p: number) => setPage(p);

  return {
    page,
    size,
    setPage: goToPage,
    setSize,
    nextPage,
    prevPage,
  };
}
