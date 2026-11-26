import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

async function prepareApp() {
  if (import.meta.env.MODE === 'mock') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

prepareApp().then(() => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
});
