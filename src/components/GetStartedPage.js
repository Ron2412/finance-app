import { useNavigate } from "react-router-dom";
import { FaMoneyCheckAlt, FaClipboardList, FaChartPie, FaPiggyBank, FaWallet } from "react-icons/fa";
import "../styles/get-started.css";

export default function GetStartedPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/username');
  };

  return (
    <div className="get-started-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master Your Finances</h1>
          <p className="hero-subtitle">
            Effortlessly track income, expenses, and savings with a premium, intuitive experience.
          </p>
          <button className="get-started-btn" onClick={handleStart} aria-label="Start tracking your finances now">
            Start Now
          </button>
        </div>
        <div className="hero-icon">
          <FaMoneyCheckAlt className="hero-icon__style" />
        </div>
      </section>

      <section className="features-section">
        <h2 className="features-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Seamless Tracking</h3>
            <p>Log transactions instantly with an elegant, user-friendly interface.</p>
          </div>
          <div className="feature-card">
            <FaChartPie className="feature-icon" />
            <h3>Smart Insights</h3>
            <p>Visualize spending with stunning charts and detailed summaries.</p>
          </div>
          <div className="feature-card">
            <FaPiggyBank className="feature-icon" />
            <h3>Maximize Savings</h3>
            <p>Set ambitious goals and watch your wealth grow effortlessly.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-header">
          <h2 className="cta-title">Ready to Begin?</h2>
          <FaWallet className="cta-icon" />
        </div>
        <p className="cta-subtitle">Join a community of savvy users mastering their finances.</p>
        <button className="get-started-btn" onClick={handleStart} aria-label="Get started with financial tracking">
          Get Started Now
        </button>
      </section>
    </div>
  );
}