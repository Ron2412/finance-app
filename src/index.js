import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './pages/App';
import GetStartedPage from './components/GetStartedPage';
import UsernamePrompt from './components/UsernamePrompt';
import './styles/index.css';
import { Analytics } from '@vercel/analytics/react';

const Root = () => {
  const username = localStorage.getItem('username');

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={username ? <Navigate to="/app" replace /> : <GetStartedPage />}
        />
        <Route path="/username" element={<UsernamePrompt />} />
        <Route path="/app" element={<App />} />
        <Route path="*" element={<Navigate to={username ? "/app" : "/"} replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);