import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './pages/App';

test('renders username greeting when username is set', () => {
  // Mock localStorage for username
  localStorage.setItem('username', 'TestUser');

  render(
    <MemoryRouter initialEntries={['/app']}>
      <App />
    </MemoryRouter>
  );

  const greetingElement = screen.getByText(/Hello, TestUser/i);
  expect(greetingElement).toBeInTheDocument();
});

// Cleanup after each test
