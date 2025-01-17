import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "./contexts/CartContext.jsx";
import { DataProvider } from "./contexts/DataContext.jsx";

import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <DataProvider>
        <AuthProvider>
          <ToastContainer />
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </DataProvider>
    </Router>
  </StrictMode>
);
