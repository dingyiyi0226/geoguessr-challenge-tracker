import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing pagination with comprehensive functionality
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default: 20)
 * @param {Array} resetTriggers - Array of dependencies that should reset pagination (optional)
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (items = [], itemsPerPage = 20, resetTriggers = []) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized calculations
  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = items.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPageItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      isPagedView: totalPages > 1
    };
  }, [items, itemsPerPage, currentPage]);

  // Reset to valid page when items change or other reset triggers
  useEffect(() => {
    const { totalPages } = paginationData;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && items.length > 0) {
      setCurrentPage(1);
    }
  }, [items.length, currentPage, itemsPerPage, ...resetTriggers]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    const { totalPages } = paginationData;
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [paginationData]);

  const nextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationData.hasPrevPage]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Generate visible page numbers with ellipsis logic
  const getVisiblePageNumbers = useCallback((delta = 2) => {
    const { totalPages } = paginationData;
    const range = [];
    const rangeWithDots = [];

    // Generate range around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Add first page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add middle range
    rangeWithDots.push(...range);

    // Add last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, paginationData]);

  // Helper for calculating page from item index (useful for drag & drop)
  const getPageFromIndex = useCallback((index) => {
    return Math.floor(index / itemsPerPage) + 1;
  }, [itemsPerPage]);

  return {
    // State
    currentPage,
    setCurrentPage,
    itemsPerPage,
    
    // Calculated values
    ...paginationData,
    
    // Navigation methods
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    
    // Utility methods
    getVisiblePageNumbers,
    getPageFromIndex,
  };
}; 