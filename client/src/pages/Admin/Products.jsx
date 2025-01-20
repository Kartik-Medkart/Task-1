import React, { useState, useEffect, useCallback } from "react";
import { searchProductsAPI, getProductAPI } from "../../services/api";
import ProductForm from "../../components/ProductForm";
import ProductEdit from "../../components/ProductEdit";
import { useData } from "../../contexts/DataContext";
import PaginationComponent from "../../components/PaginationComponent";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [tags, setTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const itemsPerPage = 8;

  const { categories } = useData();

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("Fetching products...", search, selectedCategory);
      try {
        const response = await searchProductsAPI(
          search,
          selectedCategory,
          [],
          currentPage,
          itemsPerPage
        );
        const { data } = response;
        console.log("Products: ", data.products);
        setTotalPages(data.totalPages);
        setProducts(data.products);
        setTotalProducts(data.totalItems);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, currentPage, showForm, showEdit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const editProduct = async (product) => {
    const fetchProduct = async (ws_code) => {
      try {
        const response = await getProductAPI(ws_code);
        const { data, success } = response;
        console.log("data", data);
        if (success) {
          return data;
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    const data = await fetchProduct(product.ws_code);
    setSelectedProduct(data);
    setShowEdit(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center justify-center w-xl md:w-1/2 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-1/2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-800"
            onClick={() => setShowForm(true)}
          >
            Add Product
          </button>
        </div>
        {showForm && <ProductForm onClose={() => setShowForm(false)} />}
        {showEdit && (
          <ProductEdit
            product={selectedProduct}
            onClose={() => setShowEdit(false)}
          />
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products?.length > 0 &&
            products.map((product) => (
              <div key={product.product_id} className="group">
                <img
                  alt={product.product_name}
                  src={product.image?.url || ""}
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
        <PaginationComponent
          currentPage
          totalPages={totalPages}
          totalItems={totalProducts}
          itemsPerPage
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Products;
