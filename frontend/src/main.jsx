import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1e2e',
            color: '#e2e8f0',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '0.75rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#1e1e2e' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#1e1e2e' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
