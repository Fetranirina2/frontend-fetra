import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Les anciennes connexions persistantes ne doivent plus être restaurées.
for (const cle of ['token', 'utilisateur', 'session_id', 'derniere_activite']) {
  localStorage.removeItem(cle);
  if (window.location.pathname === '/') sessionStorage.removeItem(cle);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
