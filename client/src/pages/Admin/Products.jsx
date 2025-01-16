import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, searchProducts } from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import ProductForm from "../../components/ProductForm";

const Products = () => {
  const [products, setProducts] = useState([]);
  //   const [search, setSearch] = useState("");
  //   const [sort, setSort] = useState("price-asc");
  //   const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [tags, setTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { addToCart } = useCart();
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const limit = 5;
        const response = await getProducts(currentPage, limit);
        const { data } = response.data;
        console.log("Products: ", data.products);
        setTotalPages(data.totalPages);
        setProducts(data.products);
        setTotalProducts(data.totalItems);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const editProduct = (product) => {
    console.log(product);
  };

  const PaginationComponent = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mt-5 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, totalProducts)}
            </span>{" "}
            of <span className="font-medium">{totalProducts}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                  ${
                    currentPage === index + 1
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-800"
            onClick={() => setShowForm(true)}
          >
            Add Product
          </button>
        </div>
        {showForm && <ProductForm onClose={() => setShowForm(false)} />}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products?.length > 0 &&
            products.map((product) => (
              <div key={product.product_id} className="group">
                <img
                  alt={product.product_name}
                  src={product.image.url}
                  className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-[7/8]"
                />
                <h3 className="mt-4 text-sm text-gray-700">
                  {product.product_name}
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  Rs. {product.price}
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                  onClick={() => editProduct(product)}
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Product
                </button>
              </div>
            ))}
        </div>
        <PaginationComponent />
      </div>
    </div>
  );
};

export default Products;
