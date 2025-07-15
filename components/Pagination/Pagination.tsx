import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always include last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Return array of unique page numbers
    return Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination}>
      <ul>
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.navButton}
            aria-label="Previous page"
          >
            &laquo;
          </button>
        </li>
        
        {pageNumbers.map((number, index) => {
          // Add ellipsis
          if (index > 0 && pageNumbers[index] - pageNumbers[index - 1] > 1) {
            return (
              <React.Fragment key={`ellipsis-${index}`}>
                <li key={`ellipsis-dot-${index}`} className={styles.ellipsis}>...</li>
                <li key={`ellipsis-num-${number}`}>
                  <button
                    className={`${styles.pageNumber} ${currentPage === number ? styles.active : ''}`}
                    onClick={() => onPageChange(number)}
                  >
                    {number}
                  </button>
                </li>
              </React.Fragment>
            );
          }
          
          return (
            <li key={number}>
              <button
                className={`${styles.pageNumber} ${currentPage === number ? styles.active : ''}`}
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            </li>
          );
        })}
        
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.navButton}
            aria-label="Next page"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
