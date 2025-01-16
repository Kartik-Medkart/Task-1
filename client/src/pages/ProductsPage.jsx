import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import { getProducts, searchProducts } from "../services/api";
import { useCart } from "../contexts/CartContext";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("price-asc");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const limit = 10;
        const response = await getProducts(page, limit);
        const { data } = response.data;
        console.log("Products: ", data.products);
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, [page]);

  // const searchProducts = async (searchQuery) => {
  //   try {
  //     const response = await searchProducts(searchQuery);
  //     const { data } = response.data;
  //     console.log("Products: ", data.products);
  //     setProducts(data.products);
  //   } catch (error) {
  //     console.error("Error fetching products: ", error);
  //   }
  // };

  // const debouncedFetchProducts = useCallback(debounce(searchProducts, 500), []);

  // useEffect(() => {
  //   if(search.length > 0) {
  //     debouncedFetchProducts(search);
  //   }
  // }, [search, debouncedFetchProducts]);

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
        sortedProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));
      } else {
        sortedProducts.sort((a, b) => b.product_name.localeCompare(a.product_name));
      }
    }
    setProducts(sortedProducts);
  }, [sort]);

  const handleAddToCart = (index) => {
    addToCart(products[index]);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home</option>
            {/* Add more categories as needed */}
          </select>
         </div>
          {/* <div className="mb-4">
            <label className="block mb-2">Tags</label>
            <div className="flex flex-wrap">
              {["New", "Sale", "Popular"].map((tag) => (
                <label key={tag} className="mr-4">
                  <input
                    type="checkbox"
                    value={tag}
                    checked={tags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTags([...tags, tag]);
                      } else {
                        setTags(tags.filter((t) => t !== tag));
                      }
                    }}
                    className="mr-2"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products?.length > 0 &&
            products.map((product, index) => (
              <div
                key={product.product_id}
                className="group"
              >
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
                  onClick={() => handleAddToCart(index)}
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Add to Cart
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;