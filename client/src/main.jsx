import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import 'aos/dist/aos.css';
import './index.css';
import App from './App.jsx';

// The admin page is only downloaded by people who open /admin.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
