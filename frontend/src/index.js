import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop errors (benign browser behavior)
const originalError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (message?.includes?.('ResizeObserver') || String(message).includes('ResizeObserver')) {
    return true;
  }
  return originalError ? originalError(message, source, lineno, colno, error) : false;
};

// Also suppress from error event listener
window.addEventListener('error', (e) => {
  if (e.message?.includes?.('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
