import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import CustomerPage from "./pages/CustomerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SignUpForm from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CategoriesPage from "./pages/CategoriesPage";

import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Store the intended URL in state or localStorage
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpForm />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/catgeories" element={<CategoriesPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute role="customer">
              <CartPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Pages */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Default to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
