import React, { useState, useEffect, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { getProductsAPI, searchProductsAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useData } from "../contexts/DataContext";
import ProductModal from "../components/ProductModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("price-asc");
  const [page, setPage] = useState(1);
  const { addToCart } = useCart();
  const { categories, tags } = useData();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 8;

  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    const sortedProducts = [...products];
    const sorting = sort.split("-");
    if (sorting[0] === "price") {
      if (sorting[1] === "asc") {
        sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
      } else {
        sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
      }
    } else {
      if (sorting[1] === "asc") {
        sortedProducts.sort((a, b) =>
          a.product_name.localeCompare(b.product_name)
        );
      } else {
        sortedProducts.sort((a, b) =>
          b.product_name.localeCompare(a.product_name)
        );
      }
    }
    setProducts(sortedProducts);
  }, [sort]);

  const handleAddToCart = (index) => {
    addToCart(products[index]);
  };

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      console.log("Search Product Called..!");
      try {
        const response = await searchProductsAPI(
          search,
          selectedCategory,
          selectedTags,
          currentPage,
          itemsPerPage
        );
        const { data } = response;
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalItems);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
      setLoading(false);
    };
    searchProducts();
  }, [search, selectedCategory, selectedTags, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedTags]);

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
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="mb-4">
          <div className="flex items-center gap-5 mb-4">
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            {/* <button
              onClick={searchProducts}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button> */}
          </div>
          <div className="flex gap-5">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
              {/* Add more categories as needed */}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Tags</label>
            <div className="flex flex-wrap">
              {tags.map((tag) => (
                <label key={tag.tag_id} className="mr-4">
                  <input
                    type="checkbox"
                    value={tag.name}
                    checked={selectedTags.includes(tag.tag_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.tag_id]);
                      } else {
                        setSelectedTags(
                          selectedTags.filter((t) => t !== tag.tag_id)
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products?.length == 0 ? (
              <div className="text-center">
                <div className="flex flex-col h-96">
                <h2 className="text-2xl font-bold">
                  No Products Found : {search}
                </h2>
                <div>
                  {" "}
                  {selectedCategory && (
                    <span>
                      {" "}
                      Selected Category:{" "}
                      {
                        categories.find((category) => {
                          return category.category_id == selectedCategory;
                        }).name
                      }
                    </span>
                  )}{" "}
                </div>
                <div>
                  {selectedTags.length > 0 && (
                    <span>
                      {" "}
                      Selected Tags:{" "}
                      {selectedTags
                        .map((selectedTag) => {
                          return tags.find((tag) => {
                            return tag.tag_id == selectedTag;
                          }).name;
                        })
                        .join(", ")}{" "}
                    </span>
                  )}
                </div>
                {(selectedCategory || selectedTags.length > 0) && (
                  <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"  
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedTags([]);
                    }}
                  >
                    {" "}
                    Reset Filters{" "}
                  </button>
                )}
              </div>
                </div>
            ) : (
              products.map((product, index) => (
                <div key={product.product_id} className="group">
                  <img
                    alt={product.product_name}
                    src={
                      product.image?.url || "https://via.placeholder.com/300"
                    }
                    className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-[7/8]"
                    onClick={() => setSelectedProduct(product)}
                  />
                  <h3
                    className="mt-4 text-sm text-gray-700"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.product_name}
                  </h3>
                  <p
                    className="mt-1 text-lg font-medium text-gray-900"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Rs. {product.price}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                    onClick={() => handleAddToCart(index)}
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {loading && (
          <div className="flex justify-center items-center h-screen">
            <ClipLoader size={150} color={"#123abc"} loading={loading} />
          </div>
        )}
        <PaginationComponent />
      </div>
    </div>
  );
};

export default ProductsPage;
