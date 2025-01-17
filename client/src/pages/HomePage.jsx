// import React from "react";
// import { Link } from "react-router-dom";

// const HomePage = () => {
//   const categories = [
//     { id: 1, name: "Electronics" },
//     { id: 2, name: "Fashion" },
//     { id: 3, name: "Home & Kitchen" },
//     { id: 4, name: "Sports & Outdoors" },
//   ];

//   const featuredProducts = [
//     {
//       id: 1,
//       name: "Smartphone",
//       category_id: 1,
//       price: 299.99,
//       image: "https://via.placeholder.com/150",
//     },
//     {
//       id: 2,
//       name: "Running Shoes",
//       category_id: 2,
//       price: 49.99,
//       image: "https://via.placeholder.com/150",
//     },
//     {
//       id: 3,
//       name: "Blender",
//       category_id: 3,
//       price: 19.99,
//       image: "https://via.placeholder.com/150",
//     },
//     {
//       id: 4,
//       name: "Yoga Mat",
//       category_id: 4,
//       price: 9.99,
//       image: "https://via.placeholder.com/150",
//     },
//   ];

//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     cssEase: "linear",
//   };

//   return (
//     <div className="p-6">
//       <div className="hero-banner bg-blue-500 text-white p-10 rounded-lg mb-6">
//         <h1 className="text-4xl font-bold">Welcome to Our E-Commerce Store</h1>
//         <p className="mt-2">Discover the best products at unbeatable prices.</p>
//         <Link to="/products" className="mt-4 inline-block bg-white text-blue-500 px-4 py-2 rounded">
//           Shop Now
//         </Link>
//       </div>

//       <div className="categories mb-6">
//         <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {categories.map((category) => (
//             <Link
//               key={category.id}
//               to={`/category/${category.id}`}
//               className="block bg-gray-100 p-4 rounded-lg text-center"
//             >
//               <h3 className="text-lg font-semibold">{category.name}</h3>
//             </Link>
//           ))}
//         </div>
//       </div>

//       <div className="featured-products mb-6">
//         <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {featuredProducts.map((product) => (
//             <div key={product.id} className="bg-white p-4 rounded-lg shadow">
//               <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
//               <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
//               <p className="mt-1 text-gray-600">${product.price}</p>
//               <Link
//                 to={`/product/${product.id}`}
//                 className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded"
//               >
//                 View Product
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="promotional-banner bg-green-500 text-white p-10 rounded-lg">
//         <h2 className="text-3xl font-bold">Special Offer</h2>
//         <p className="mt-2">Get 20% off on your first purchase. Use code: WELCOME20</p>
//         <Link to="/products" className="mt-4 inline-block bg-white text-green-500 px-4 py-2 rounded">
//           Shop Now
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

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