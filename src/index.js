import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './pages/App';
import GetStartedPage from './components/GetStartedPage';
import UsernamePrompt from './components/UsernamePrompt';
import './styles/index.css';

const Root = () => {
  const username = localStorage.getItem('username');
  const initialPath = username ? '/app' : '/';
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GetStartedPage />} />
        <Route path="/username" element={<UsernamePrompt />} />
        <Route path="/app" element={<App />} />
        <Route path="*" element={<Navigate to={initialPath} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);