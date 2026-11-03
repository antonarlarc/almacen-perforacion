// src/index.js - Entry point para la app
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Montar la app
const container = document.getElementById('root');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);