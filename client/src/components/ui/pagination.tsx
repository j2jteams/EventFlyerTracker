import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const renderPageButtons = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        className={`px-3 py-2 ${currentPage === 1 ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}
        onClick={() => onPageChange(1)}
      >
        1
      </Button>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <span key="ellipsis1" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }

    // Add pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            className={`px-3 py-2 ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="ellipsis2" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          className={`px-3 py-2 ${currentPage === totalPages ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <nav className="inline-flex shadow-sm rounded-md">
      <Button
        variant="outline"
        className="px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-l-md hover:bg-gray-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {renderPageButtons()}
      
      <Button
        variant="outline"
        className="px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-r-md hover:bg-gray-50"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
