import { useState, useEffect, useRef, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { subDays, isWithinInterval, format } from "date-fns";
import {
  FaPlus,
  FaBell,
  FaChevronRight,
  FaUtensils,
  FaMoneyBillWave,
  FaFilm,
  FaShoppingBag,
  FaCar,
  FaFileExport,
  FaUser,
  FaArrowLeft,
  FaCheck,
  FaTrash,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaHome,
  FaList,
  FaEdit,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import TransactionsPage from '../components/TransactionsPage';
import '../styles/index.css';
import '../styles/transaction-form.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
  { id: "food", name: "Food", icon: <FaUtensils />, bgClass: "food-bg" },
  { id: "income", name: "Income", icon: <FaMoneyBillWave />, bgClass: "income-bg" },
  { id: "entertainment", name: "Entertainment", icon: <FaFilm />, bgClass: "entertainment-bg" },
  { id: "shopping", name: "Shopping", icon: <FaShoppingBag />, bgClass: "shopping-bg" },
  { id: "transport", name: "Transport", icon: <FaCar />, bgClass: "transport-bg" },
];

const currencyOptions = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [dateFilter, setDateFilter] = useState(() => localStorage.getItem("dateFilter") || "all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastDeleted, setLastDeleted] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "USD");
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("budget")) || 0);
  const [notifications, setNotifications] = useState([]);
  const amountInputRef = useRef(null);

  useEffect(() => {
    console.log("Checking localStorage on mount:", {
      username: localStorage.getItem("username"),
      transactions: localStorage.getItem("transactions"),
      budget: localStorage.getItem("budget"),
    });
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      loadTransactions();
    } else {
      navigate("/username");
    }
  }, [navigate]);

  const loadTransactions = () => {
    try {
      const stored = localStorage.getItem("transactions");
      console.log("Raw transactions from localStorage:", stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
          console.log("Loaded transactions:", parsed);
        } else {
          console.warn("Invalid transactions format, keeping empty");
          setTransactions([]);
        }
      } else {
        console.log("No transactions found, keeping empty");
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setTransactions([]);
    }
  };

  const saveTransactions = (data) => {
    try {
      if (!Array.isArray(data)) {
        console.warn("Attempted to save non-array transactions:", data);
        return;
      }
      const serialized = JSON.stringify(data);
      localStorage.setItem("transactions", serialized);
      console.log("Saved transactions:", data);
      const verify = localStorage.getItem("transactions");
      console.log("Verified localStorage:", JSON.parse(verify || "[]"));
    } catch (err) {
      console.error("Error saving transactions:", err);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    console.log("Saved theme:", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dateFilter", dateFilter);
    localStorage.setItem("currency", currency);
    localStorage.setItem("budget", budget);
    console.log("Saved settings:", { dateFilter, currency, budget });
  }, [dateFilter, currency, budget]);

  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
    // Check budget thresholds
    const totalExpenses = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    if (budget > 0) {
      const progress = (totalExpenses / budget) * 100;
      if (progress >= 100 && !notifications.some(n => n.message === "Budget exceeded!")) {
        setNotifications((prev) => [...prev, { id: Date.now(), message: "Budget exceeded!" }]);
      } else if (progress >= 80 && !notifications.some(n => n.message === "Warning: 80% of budget used")) {
        setNotifications((prev) => [...prev, { id: Date.now(), message: "Warning: 80% of budget used" }]);
      }
    }
  }, [transactions, budget]);

  useEffect(() => {
    if (showAddForm && amountInputRef.current) amountInputRef.current.focus();
  }, [showAddForm]);

  const handleLogout = () => {
    if (window.confirm("Resetting will clear all your data. Are you sure?")) {
      localStorage.removeItem("username");
      localStorage.removeItem("transactions");
      localStorage.removeItem("theme");
      localStorage.removeItem("currency");
      localStorage.removeItem("dateFilter");
      localStorage.removeItem("budget");
      console.log("Cleared localStorage");
      navigate("/");
    }
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleCurrencyChange = (e) => setCurrency(e.target.value);

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !isNaN(value))) {
      setBudget(Number(value) || 0);
    }
  };

  const validateAmount = (value) => {
    if (!value) return "Amount is required.";
    if (isNaN(value) || Number(value) <= 0) return "Amount must be a positive number.";
    return "";
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError(validateAmount(value));
  };

  const addOrUpdateTransaction = (e) => {
    e.preventDefault();
    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const transactionAmount = Number.parseFloat(amount);
    const finalAmount = transactionType === "expense" ? -transactionAmount : transactionAmount;
    const category = transactionType === "income" ? "Income" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    const desc = description || category;

    const transaction = {
      id: editTransactionId || Date.now(),
      description: desc,
      amount: finalAmount,
      date: new Date().toISOString().split("T")[0],
      category,
    };

    console.log("Preparing transaction:", transaction);

    try {
      setTransactions((prev) => {
        const updated = editTransactionId
          ? prev.map((t) => (t.id === editTransactionId ? transaction : t))
          : [...prev, transaction];
        console.log("New transactions state:", updated);
        saveTransactions(updated);
        return updated;
      });
      resetForm();
    } catch (err) {
      console.error("Error updating transactions:", err);
      setError("Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = (id) => {
    const transactionToDelete = transactions.find((t) => t.id === id);
    setLastDeleted(transactionToDelete);
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      console.log("Deleted transaction ID:", id, "New state:", updated);
      saveTransactions(updated);
      return updated;
    });
    setTimeout(() => setLastDeleted(null), 5000);
  };

  const editTransaction = (transaction) => {
    setEditTransactionId(transaction.id);
    setDescription(transaction.description);
    setAmount(Math.abs(transaction.amount).toString());
    setTransactionType(transaction.amount > 0 ? "income" : "expense");
    setSelectedCategory(transaction.amount > 0 ? "income" : transaction.category.toLowerCase());
    setShowAddForm(true);
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setTransactionType("expense");
    setSelectedCategory("food");
    setShowAddForm(false);
    setEditTransactionId(null);
    setError("");
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const exportToCSV = () => {
    const currentCurrency = currencyOptions.find((c) => c.code === currency);
    const csvContent = [
      ["ID", "Description", "Amount", "Date", "Category"],
      ...transactions.map((t) => [
        t.id,
        t.description,
        `${currentCurrency.symbol}${Math.abs(t.amount).toFixed(2)} ${t.amount < 0 ? "(Expense)" : "(Income)"}`,
        t.date,
        t.category,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterTransactionsByDate = (filter) => {
    const today = new Date();
    const validDate = (dateString) => (isNaN(new Date(dateString).getTime()) ? new Date() : new Date(dateString));
    if (filter === "today") return transactions.filter((t) => validDate(t.date).toLocaleDateString() === today.toLocaleDateString());
    if (filter === "weekly") return transactions.filter((t) => isWithinInterval(validDate(t.date), { start: subDays(today, 7), end: today }));
    if (filter === "monthly") return transactions.filter((t) => validDate(t.date).getMonth() === today.getMonth() && validDate(t.date).getFullYear() === today.getFullYear());
    return transactions;
  };

  const totalIncome = useMemo(() => filterTransactionsByDate(dateFilter).filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0), [dateFilter, transactions]);
  const totalExpenses = useMemo(() => filterTransactionsByDate(dateFilter).filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0), [dateFilter, transactions]);
  const sortedRecentTransactions = useMemo(() => filterTransactionsByDate(dateFilter).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [dateFilter, transactions]);
  const budgetRemaining = useMemo(() => budget - totalExpenses, [budget, totalExpenses]);
  const budgetProgress = useMemo(() => budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0, [budget, totalExpenses]);

  const currentCurrencySymbol = currencyOptions.find((c) => c.code === currency)?.symbol || "$";

  const doughnutData = {
    labels: ["Income", "Expenses"],
    datasets: [{
      data: [totalIncome, totalExpenses],
      backgroundColor: ["#4caf50", "#ef5350"],
      borderWidth: 1,
      cutout: "70%"
    }]
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const getCategoryIcon = (category) => categories.find((c) => c.name.toLowerCase() === category?.toLowerCase())?.icon || <FaFileExport />;
  const getCategoryClass = (category) => categories.find((c) => c.name.toLowerCase() === category?.toLowerCase())?.bgClass || "";

  if (!username) return null;

  return (
    <div className="app-container">
      <nav className="desktop-nav">
        <div className="desktop-nav__items">
          <div className={`desktop-nav__item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")} aria-label="Home">
            <FaHome className="nav-icon" /><span>Home</span>
          </div>
          <div className={`desktop-nav__item ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")} aria-label="Transactions">
            <FaList className="nav-icon" /><span>Transactions</span>
          </div>
          <div className="desktop-nav__item" onClick={() => setShowAddForm(true)} aria-label="Add Transaction">
            <FaPlus className="nav-icon" /><span>Add Transaction</span>
          </div>
          <div className={`desktop-nav__item ${activeTab === "export" ? "active" : ""}`} onClick={() => { setActiveTab("export"); exportToCSV(); }} aria-label="Export Transactions">
            <FaFileExport className="nav-icon" /><span>Export</span>
          </div>
          <div className={`desktop-nav__item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")} aria-label="Profile">
            <FaUser className="nav-icon" /><span>Profile</span>
          </div>
        </div>
      </nav>

      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: 'var(--card-bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                maxWidth: '300px'
              }}
            >
              <FaBell color="var(--primary-dark)" />
              <span style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', color: 'var(--text-primary)' }}>
                {notification.message}
              </span>
              <button
                onClick={() => dismissNotification(notification.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Dismiss notification"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "home" && (
        <div className="main-content">
          <header className="app-header">
            <div className="greeting"><span className="greeting__hello">Hello,</span><span className="greeting__name">{username}</span></div>
            <div className="header-actions">
              <button className="notification-btn" title="Notifications" aria-label="View notifications"><FaBell /></button>
              <button className="notification-btn" onClick={handleLogout} title="Reset" aria-label="Reset app"><FaSignOutAlt /></button>
            </div>
          </header>

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

          <div className="summary-card">
            <div className="summary-content">
              <div className="summary-label income-label">Income</div>
              <div className="summary-amount">{currentCurrencySymbol}{totalIncome.toLocaleString()}</div>
              <div className="summary-label expense-label">Spent</div>
              <div className="summary-amount">{currentCurrencySymbol}{totalExpenses.toLocaleString()}</div>
              <div className="summary-label" style={{ marginTop: '1rem' }}>Budget</div>
              <div className="summary-amount">{currentCurrencySymbol}{budget.toLocaleString()}</div>
              <div className="summary-label">Remaining</div>
              <div className={`summary-amount ${budgetRemaining < 0 ? 'expense' : 'income'}`}>
                {currentCurrencySymbol}{Math.abs(budgetRemaining).toLocaleString()} {budgetRemaining < 0 ? '(Over)' : ''}
              </div>
            </div>
            <div className="summary-chart">
              <Doughnut data={doughnutData} options={doughnutOptions} />
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
          </div>

          <div className="transactions-section">
            <div className="section-header">
              <h3 className="section-title">Recent Transactions</h3>
              <div className="see-all" onClick={() => setActiveTab("transactions")} aria-label="See all transactions">
                See All <FaChevronRight />
              </div>
            </div>
            {sortedRecentTransactions.length === 0 ? (
              <div className="empty-state">No transactions yet. Add one to get started!</div>
            ) : (
              <div className="transaction-list">
                {sortedRecentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className={`transaction-icon ${getCategoryClass(transaction.category)}`}>
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-title">{transaction.description}</div>
                      <div className="transaction-subtitle">{transaction.category}</div>
                    </div>
                    <div>
                      <div className={`transaction-amount ${transaction.amount < 0 ? "expense" : "income"}`}>
                        {transaction.amount < 0 ? "-" : "+"}{currentCurrencySymbol}{Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <div className="transaction-date">{format(new Date(transaction.date), "MMM dd, yyyy")}</div>
                    </div>
                    <button
                      className="edit-btn"
                      onClick={() => editTransaction(transaction)}
                      aria-label={`Edit transaction ${transaction.description}`}
                    >
                      <FaEdit />
                    </button>
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
            )}
          </div>

          {lastDeleted && (
            <div className="undo-bar">
              Transaction deleted.{" "}
              <button
                className="undo-btn"
                onClick={() => setTransactions((prev) => [...prev, lastDeleted]) && setLastDeleted(null)}
                aria-label="Undo delete"
              >
                Undo
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="main-content">
          <TransactionsPage
            transactions={transactions}
            deleteTransaction={deleteTransaction}
            filterTransactionsByDate={filterTransactionsByDate}
            currencySymbol={currentCurrencySymbol}
            budget={budget}
            totalExpenses={totalExpenses}
          />
        </div>
      )}
      {activeTab === "export" && (
        <div className="main-content">
          <header className="app-header"><h1 className="greeting-name">Export Transactions</h1></header>
          <p>Your transactions have been exported as a CSV file. Check your downloads!</p>
        </div>
      )}
      {activeTab === "profile" && (
        <div className="main-content">
          <header className="app-header"><h1 className="greeting-name">Profile</h1></header>
          <div className="profile-section">
            <div className="profile-info">
              <FaUser size={40} color="var(--primary-dark)" />
              <div>
                <h2>{username}</h2>
              </div>
            </div>
            <div className="profile-settings">
              <div className="setting-item">
                <label><FaMoneyBillWave /> Currency</label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={handleCurrencyChange}
                  className="profile-select"
                  aria-label="Select currency"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} ({option.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="setting-item">
                <label><FaMoneyBillWave /> Monthly Budget</label>
                <input
                  type="number"
                  value={budget}
                  onChange={handleBudgetChange}
                  className="profile-select"
                  placeholder={`${currentCurrencySymbol}0.00`}
                  step="0.01"
                  min="0"
                  aria-label="Set monthly budget"
                />
              </div>
              <div className="setting-item">
                <label>{theme === "light" ? <FaSun /> : <FaMoon />} Theme</label>
                <button
                  className="profile-toggle-btn"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                >
                  {theme === "light" ? "Switch to Dark" : "Switch to Light"}
                </button>
              </div>
              <div className="setting-item">
                <label><FaSignOutAlt /> Reset</label>
                <button
                  className="profile-logout-btn"
                  onClick={handleLogout}
                  aria-label="Reset app"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="transaction-form-window">
          <div className="transaction-form-container">
            <div className="transaction-form-header">
              <button
                className="transaction-form__back-button"
                onClick={resetForm}
                aria-label="Back to main view"
              >
                <FaArrowLeft />
              </button>
              <h2 className="transaction-form-title">{editTransactionId ? "Edit Transaction" : "Add Transaction"}</h2>
            </div>

            <div className="transaction-form-content">
              <div className="transaction-form__form-group">
                <label className="transaction-form__form-label">Amount</label>
                <input
                  ref={amountInputRef}
                  type="number"
                  className={`transaction-form__amount-input ${error ? "input-error" : ""}`}
                  placeholder={`${currentCurrencySymbol}0.00`}
                  value={amount}
                  onChange={handleAmountChange}
                  step="0.01"
                  required
                  aria-label="Transaction amount"
                />
                {error && <p className="transaction-form__error-message">{error}</p>}
              </div>
              <div className="transaction-form__form-group">
                <label className="transaction-form__form-label">Description</label>
                <input
                  type="text"
                  className="transaction-form__amount-input"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-label="Transaction description"
                />
              </div>
              <div className="transaction-form__form-group">
                <label className="transaction-form__form-label">Category</label>
                <div className="transaction-form__category-list">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`transaction-form__category-option ${selectedCategory === category.id ? "selected" : ""}`}
                      onClick={() => setSelectedCategory(category.id) || setTransactionType(category.id === "income" ? "income" : "expense")}
                      aria-label={`Select ${category.name} category`}
                    >
                      <div className={`transaction-form__category-icon-wrapper ${category.bgClass}`}>
                        {category.icon}
                      </div>
                      <span>{category.name}</span>
                      {selectedCategory === category.id && <FaCheck style={{ marginLeft: "auto", color: "var(--primary-dark)" }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="transaction-form-footer">
              <button className="transaction-form__btn transaction-form__btn--outline" onClick={resetForm} aria-label="Cancel">
                Cancel
              </button>
              <button
                className="transaction-form__btn transaction-form__btn--primary"
                onClick={addOrUpdateTransaction}
                disabled={isSubmitting || !!error}
                aria-label={editTransactionId ? "Update transaction" : "Add transaction"}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : editTransactionId ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")} aria-label="Home">
          <FaHome className="nav-icon" /><span>Home</span>
        </div>
        <div className={`nav-item ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")} aria-label="Transactions">
          <FaList className="nav-icon" /><span>Transactions</span>
        </div>
        <div className="nav-item" onClick={() => setShowAddForm(true)} aria-label="Add Transaction">
          <div className="add-button"><FaPlus /></div>
        </div>
        <div className={`nav-item ${activeTab === "export" ? "active" : ""}`} onClick={() => { setActiveTab("export"); exportToCSV(); }} aria-label="Export Transactions">
          <FaFileExport className="nav-icon" /><span>Export</span>
        </div>
        <div className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")} aria-label="Profile">
          <FaUser className="nav-icon" /><span>Profile</span>
        </div>
      </div>
    </div>
  );
}

export default App;