import { getProductImagesTagsAPI } from "../services/api/index";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useData } from "../contexts/DataContext";

const ProductModal = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [productTags, setProductTags] = useState([]);
  const { tags, categories } = useData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    console.log(interval);

    return () => clearInterval(interval);
  }, [productImages.length]);

  useEffect(() => {
    console.log(tags, categories);
    const fetchProductImages = async () => {
      try {
        const response = await getProductImagesTagsAPI(product.product_id);
        const { data, success, message } = response;
        if (success) {
          setProductImages(data.images);
          setProductTags(data.tags);
        }
      } catch (error) {
        console.error("Error in fetching product images.", error);
      }
    };
    fetchProductImages();
  }, [product]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Product Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <img
              src={productImages[currentImageIndex]?.url || ""}
              alt={product.product_name}
              className="w-full h-48 object-cover rounded"
            />
            <button
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full"
              onClick={handlePrevImage}
            >
              &lt;
            </button>
            <button
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full"
              onClick={handleNextImage}
            >
              &gt;
            </button>
          </div>
          <div className="flex justify-center mt-2">
            {productImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${
                  currentImageIndex === index ? "bg-gray-800" : "bg-gray-400"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              ></button>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Name: {product.product_name}
            </h3>
            <p>WS Code: {product.ws_code}</p>
            <p>Price: Rs {product.price}</p>
            <p>Package Size: {product.package_size}</p>
            <p>
              Category Name:{" "}
              {
                categories.find((category) => {
                  return category.category_id === product.category_id;
                }).name
              }
            </p>
            <p>
              Tags:{" "}
              {productTags.map((selectedTag) => {
                return tags
                  .find((tag) => {
                    return tag.tag_id === selectedTag;
                  }).name;
              }).join(", ")}
              {
                productTags.length === 0 && "No Tags"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
