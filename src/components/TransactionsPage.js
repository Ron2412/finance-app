import { useState } from "react";
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/index.css";

function TransactionsPage({ transactions, deleteTransaction, filterTransactionsByDate, currencySymbol, budget, totalExpenses }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = filterTransactionsByDate(dateFilter)
    .filter((t) => t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const budgetRemaining = budget - totalExpenses;
  const budgetProgress = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="main-content">
      <header className="app-header">
        <h1 className="greeting-name">Transactions</h1>
      </header>

      <div className="summary-card" style={{ marginBottom: '1.5rem' }}>
        <div className="summary-content">
          <div className="summary-label">Budget</div>
          <div className="summary-amount">{currencySymbol}{budget.toLocaleString()}</div>
          <div className="summary-label">Spent</div>
          <div className="summary-amount">{currencySymbol}{totalExpenses.toLocaleString()}</div>
          <div className="summary-label">Remaining</div>
          <div className={`summary-amount ${budgetRemaining < 0 ? 'expense' : 'income'}`}>
            {currencySymbol}{Math.abs(budgetRemaining).toLocaleString()} {budgetRemaining < 0 ? '(Over)' : ''}
          </div>
        </div>
        {budget > 0 && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <div style={{
              width: '100%',
              height: '10px',
              background: 'var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${budgetProgress}%`,
                height: '100%',
                background: budgetRemaining < 0 ? 'var(--expense)' : 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {budgetProgress.toFixed(1)}% of budget used
            </p>
          </div>
        )}
      </div>

      <div className="filter-tabs">
        {["all", "today", "weekly", "monthly"].map((filter) => (
          <button
            key={filter}
            className={`filter-tab ${dateFilter === filter ? "active" : ""}`}
            onClick={() => setDateFilter(filter)}
            aria-label={`Filter by ${filter}`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="transactions__search"
        placeholder="Search transactions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search transactions"
      />

      {paginatedTransactions.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <>
          <div className="transaction-list">
            {paginatedTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-title">{transaction.description}</div>
                  <div className="transaction-subtitle">{transaction.category}</div>
                </div>
                <div>
                  <div className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                    {transaction.amount < 0 ? "-" : "+"}{currencySymbol}{Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTransaction(transaction.id)}
                  aria-label={`Delete transaction ${transaction.description}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination__button ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ))}
              <button
                className="pagination__button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionsPage;