import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { useData } from "../contexts/DataContext";
import {
  updateProductAPI,
  updateProductImageAPI,
  updateProductImagesAPI,
} from "../services/api";

const ProductEdit = ({ product, onClose }) => {
  const [editingImageIndex, setEditingImageIndex] = useState(null); // Track the image being edited
  const { categories, tags } = useData();

  const [initialValues, setInitialValues] = useState({
    product_name: product?.product_name || "",
    price: product?.price || "",
    package_size: product?.package_size || "",
    category_id: product?.category_id || "",
    tags: product?.tags || [],
    images: product?.images || [],
  });

  console.log(initialValues);

  const validationSchema = Yup.object().shape({
    product_name: Yup.string().required("Product name is required"),
    // ws_code: Yup.number().required("WS Code is required"),
    price: Yup.number().required("Price is required"),
    package_size: Yup.number().required("Package size is required"),
    category_id: Yup.number().required("Category is required"),
    tags: Yup.array().of(Yup.string()).required("At least one tag is required"),
    images: Yup.array()
      .of(Yup.mixed())
      .required("At least one image is required"),
  });

  const handleImageUpload = async (e, setFieldValue, values) => {
    const files = Array.from(e.target.files);

    if (editingImageIndex !== null) {
      const formData = new FormData();
      formData.append("currentImageId", product.images[editingImageIndex].id);
      formData.append("image", files[0]);
      const response = await updateProductImageAPI(formData);
      const { data, success, message } = response;
      console.log(data, success, message);
      if (success) {
        toast.success(message);
      }
      const updatedImages = [...values.images];
      updatedImages[editingImageIndex] = files[0];
      setFieldValue("images", updatedImages);
      setEditingImageIndex(null); // Reset the editing index
    } else {
      // Replace all images
      setFieldValue("images", files);
    }
  };

  const handleRemoveImage = (setFieldValue, values, index) => {
    const updatedImages = values.images.filter((_, i) => i !== index);
    setFieldValue("images", updatedImages);
  };

  const saveImages = async (images) => {
    try {
      const formData = new FormData();
      formData.append("WsCode", product.ws_code);
      images.forEach((image) => formData.append("images", image));

      const response = await updateProductImagesAPI(formData);
      const { data, status, message } = response;

      if (status) toast.success("Images updated successfully");
    } catch (error) {
      console.error("Error updating images:", error);
      toast.error("Error updating images");
    }
  };

  const saveDetails = async (values) => {
    const { ws_code, images, ...data } = values;
    try {
      const response = await updateProductAPI(product.ws_code, data);
      const { success } = response;
      if (success) toast.success("Product details updated successfully");
    } catch (error) {
      console.error("Error updating product details:", error);
      toast.error("Error updating product details");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            saveDetails(values);
            onClose();
            setSubmitting(false);
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-2">Product Name</label>
                <Field
                  type="text"
                  name="product_name"
                  className="w-full p-2 border rounded-md"
                />
                <ErrorMessage
                  name="product_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-2">Price</label>
                <Field
                  type="number"
                  name="price"
                  className="w-full p-2 border rounded-md"
                />
                <ErrorMessage
                  name="price"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Package Size</label>
                <Field
                  type="number"
                  name="package_size"
                  className="w-full p-2 border rounded-md"
                />
                <ErrorMessage
                  name="package_size"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Category</label>
                <Field
                  as="select"
                  name="category_id"
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="category_id"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="tags"
                  className="block text-md font-medium text-gray-700"
                >
                  Tags
                </label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                  onChange={(event) => {
                    const selectedTag = event.target.value;
                    if (selectedTag && !values.tags.includes(selectedTag)) {
                      setFieldValue("tags", [...values.tags, selectedTag]);
                    }
                  }}
                >
                  <option value="">Select tags</option>
                  {tags.map((tag) => (
                    <option key={tag.tag_id} value={tag.tag_id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap mt-2">
                  {values.tags.map((tag) => (
                    <div
                      key={tag}
                      className="mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-white"
                        onClick={() => {
                          setFieldValue(
                            "tags",
                            values.tags.filter((t) => t !== tag)
                          );
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="tags"
                  component="div"
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, setFieldValue, values)}
                  className="w-full p-2 border rounded-md"
                />
                <div className="flex flex-wrap mt-2">
                  {values.images.map((image, index) => (
                    <div key={index} className="relative mr-2 mb-2">
                      <img
                        src={
                          image?.url ? image.url : URL.createObjectURL(image)
                        }
                        alt="Product"
                        className="w-32 h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 mt-1 mr-1 text-white bg-red-500 rounded-full p-1"
                        onClick={() =>
                          handleRemoveImage(setFieldValue, values, index)
                        }
                      >
                        &times;
                      </button>
                      <button
                        type="button"
                        className="absolute top-0 left-0 mt-1 ml-1 text-white bg-blue-500 rounded-full p-1"
                        onClick={() => setEditingImageIndex(index)}
                      >
                        ✎
                      </button>
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="images"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => saveImages(values.images)}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                  Save Images
                </button>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="p-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Save Details"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductEdit;
