import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const futureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App future={futureFlags} />
  </React.StrictMode>
);
