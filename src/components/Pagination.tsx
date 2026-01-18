interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const itemsPerPage = 100;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing <span>{startItem.toLocaleString()}</span> to{' '}
        <span>{endItem.toLocaleString()}</span> of{' '}
        <span>{totalCount.toLocaleString()}</span> transactions
      </div>
      
      <div className="pagination-buttons">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ««
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          «
        </button>
        
        {pageNumbers.map((pageNum, idx) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0.25rem 0.5rem', color: 'var(--slate-500)' }}>...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          »
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          »»
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  const delta = 2;
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if ((i as number) - l === 2) {
        rangeWithDots.push(l + 1);
      } else if ((i as number) - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i as number;
  }

  return rangeWithDots;
}
