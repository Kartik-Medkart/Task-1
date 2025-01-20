import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="p-6">
      <div className="hero-banner bg-blue-500 text-white p-10 rounded-lg mb-6">
        <h1 className="text-4xl font-bold">Welcome to Our E-Commerce Store</h1>
        <p className="mt-2">Discover the best products at unbeatable prices.</p>
        <Link to="/products" className="mt-4 inline-block bg-white text-blue-500 px-4 py-2 rounded">
          Shop Now
        </Link>
      </div>

      <div className="promotional-banner bg-green-500 text-white p-10 rounded-lg">
        <h2 className="text-3xl font-bold">Special Offer</h2>
        <p className="mt-2">Get 20% off on your first purchase. Use code: WELCOME20</p>
        <Link to="/products" className="mt-4 inline-block bg-white text-green-500 px-4 py-2 rounded">
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default HomePage;