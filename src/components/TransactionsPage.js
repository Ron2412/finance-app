import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../styles/index.css";

function TransactionsPage({ transactions, deleteTransaction, filterTransactionsByDate, currencySymbol, getBudgetStatus }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredTransactions = filterTransactionsByDate(dateFilter)
    .filter((t) => t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="main-content">
      <header className="app-header"><h1 className="greeting-name">Transactions</h1></header>

      <div className="filter-tabs">
        {["all", "today", "weekly", "monthly"].map((filter) => (
          <button key={filter} className={`filter-tab ${dateFilter === filter ? "active" : ""}`} onClick={() => setDateFilter(filter)}>
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
      />

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <div className="transaction-list">
          {filteredTransactions.map((transaction) => {
            const { budget, spent, remaining } = getBudgetStatus(transaction.category);
            const progress = budget > 0 ? (spent / budget) * 100 : 0;
            return (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-title">{transaction.description}</div>
                  <div className="transaction-subtitle">{transaction.category}</div>
                  {transaction.category !== "Income" && budget > 0 && (
                    <div className="budget-progress-bar" style={{ marginTop: "0.5rem" }}>
                      <div
                        className="budget-progress"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: remaining >= 0 ? "var(--income)" : "var(--expense)",
                        }}
                      />
                      <div className="budget-info" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        <span>{currencySymbol}{spent.toFixed(2)} spent</span>
                        <span>{currencySymbol}{remaining.toFixed(2)} remaining</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className={`transaction-amount ${transaction.amount < 0 ? "expense" : "income"}`}>
                    {transaction.amount < 0 ? "-" : "+"}{currencySymbol}{Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
                <button className="delete-btn" onClick={() => deleteTransaction(transaction.id)}><FaTrash /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;