import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createProductAPI } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import { useData } from "../contexts/DataContext";

const ProductForm = ({ onClose }) => {
  const initialValues = {
    product_name: "",
    ws_code: "",
    price: "",
    package_size: "",
    images: [],
    category_id: "",
    tags: [],
  };
  // const [selectedTags, setSelectedTags] = useState([]);

  const { categories, tags } = useData();
  const [isModelOpen, setIsModelOpen] = useState(false);

  const validationSchema = Yup.object({
    product_name: Yup.string().required("Product name is required"),
    ws_code: Yup.string().required("WS code is required"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be positive"),
    package_size: Yup.string().required("Package size is required"),
    category_id: Yup.string().required("Category is required"),
    tags: Yup.array(),
    images: Yup.array()
      .max(4, "You can only upload up to 4 images")
      .required("At least one image is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();

    formData.append("product_name", values.product_name);
    formData.append("ws_code", values.ws_code);
    formData.append("price", values.price);
    formData.append("package_size", values.package_size);
    formData.append("category_id", values.category_id);

    values.images.forEach((imageObj) => {
      formData.append(`images`, imageObj);
    });

    values.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    try {
      const response = await createProductAPI(formData);
      const { success, message } = response;
      if (success) {
        setSubmitting(false);
        onClose();
        toast.success(message);
      }
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const handleImageUpload = (e, setFieldValue, values) => {
    console.log("e.target.files: ", e.target.files);
    const files = Array.from(e.target.files);
    console.log("current file: ", files);
    setFieldValue("images", [...values.images, ...files]);
  };

  const handleRemoveImage = (setFieldValue, values, index) => {
    const updatedImages = values.images.filter((_, i) => i !== index);
    setFieldValue("images", updatedImages);
  };

  const hasFieldChanged = (fieldName, initialValues, currentValues) => {
    if(fieldName === "images" || fieldName === "tags") {
      return JSON.stringify(initialValues[fieldName]) !== JSON.stringify(currentValues[fieldName]);
    }
    return initialValues[fieldName] !== currentValues[fieldName];
  };

  const handleCancel = () => {
    setIsModelOpen(false);
  };

  const handleConfirm = () => {
    setIsModelOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="product_name"
                  className="block text-md font-medium text-gray-700"
                >
                  Product Name
                </label>
                <Field
                  name="product_name"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
                <ErrorMessage
                  name="product_name"
                  component="div"
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="ws_code"
                  className="block text-md font-medium text-gray-700"
                >
                  WS Code
                </label>
                <Field
                  name="ws_code"
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
                <ErrorMessage
                  name="ws_code"
                  component="div"
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div className="flex gap-5">
                <div className="mb-4">
                  <label
                    htmlFor="price"
                    className="block text-md font-medium text-gray-700"
                  >
                    Price
                  </label>
                  <Field
                    name="price"
                    type="number"
                    className="mt-1 block border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-md mt-1"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="package_size"
                    className="block text-md font-medium text-gray-700"
                  >
                    Package Size
                  </label>
                  <Field
                    name="package_size"
                    type="text"
                    className="mt-1 block border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                  />
                  <ErrorMessage
                    name="package_size"
                    component="div"
                    className="text-red-500 text-md mt-1"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="images"
                  className="block text-md font-medium text-gray-700"
                >
                  Images
                </label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  className="mt-1 mb-2 px-4 py-2 border rounded-sm p-1 text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, setFieldValue, values)}
                />
                <div className="flex flex-wrap mt-2">
                  {values.images.map((imageUrl, index) => (
                    <div key={index} className="mr-2 mb-2 relative">
                      <img
                        src={URL.createObjectURL(imageUrl)}
                        alt="Category"
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
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="images"
                  component="div"
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category_id"
                  className="block text-md font-medium text-gray-700"
                >
                  Category
                </label>
                <Field
                  as="select"
                  name="category_id"
                  className="mt-1 block w-full border border-gray-300 rounded-sm p-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                >
                  <option value="">Select a category</option>
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
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div className="mb-4">
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
                  value="Select Tags"
                >
                  <option value="">Select tags</option>
                  {tags.map((tag) => (
                    <option key={tag.tag_id} value={tag.tag_id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap mt-2">
                  {values.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                    >
                      <span>{tags.find((t) => t.tag_id == tag).name}</span>
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
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => {
                    const fieldsChanged = Object.keys(initialValues).filter(
                      (field) => hasFieldChanged(field, initialValues, values)
                    );
                    if (fieldsChanged.length > 0) {
                      setIsModelOpen(true);
                    } else {
                      onClose();
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Save Product"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <ConfirmationModal
          isOpen={isModelOpen}
          message={"Are You Sure You Want to Close Without Saving ?"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ProductForm;
