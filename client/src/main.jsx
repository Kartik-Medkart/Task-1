import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import App from "./App.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CartProvider } from "./contexts/CartContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ToastContainer />
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
