// components/Pagination/Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <nav className="d-flex justify-content-center" aria-label="Page navigation">
      <ul>
        {/* Previous Page */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <i className="bi bi-arrow-left"></i>
            <span className="d-none d-sm-inline">Previous</span>
          </button>
        </li>

        {/* First Page + Ellipsis if needed */}
        {getPageNumbers()[0] > 1 && (
          <>
            <li>
              <button onClick={() => onPageChange(1)}>1</button>
            </li>
            {getPageNumbers()[0] > 2 && (
              <li className="ellipsis">...</li>
            )}
          </>
        )}

        {/* Page Numbers */}
        {getPageNumbers().map(page => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Last Page + Ellipsis if needed */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
              <li className="ellipsis">...</li>
            )}
            <li>
              <button onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next Page */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span className="d-none d-sm-inline">Next</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;