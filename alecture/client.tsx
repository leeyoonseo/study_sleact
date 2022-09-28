import React from "react";
import ReactDOM from 'react-dom/client';
import App from '@layouts/App/index';
import { BrowserRouter } from "react-router-dom";
import './index.css';

const appNode = document.getElementById('app');

if (!appNode) {
  throw new Error('Failed to find the app element');
}

ReactDOM.createRoot(appNode).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
