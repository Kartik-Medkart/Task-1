import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ProductForm = ({ onClose }) => {
  const initialValues = {
    productName: "",
    wsCode: "",
    price: "",
    packageSize: "",
    images: [],
    category: "",
    tags: [],
  };

  const validationSchema = Yup.object({
    productName: Yup.string().required("Product name is required"),
    wsCode: Yup.string().required("WS code is required"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be positive"),
    packageSize: Yup.string().required("Package size is required"),
    category: Yup.string().required("Category is required"),
    tags: Yup.array().min(1, "At least one tag is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await addProductAPI(values);
      const { success, message } = response.data;
      if (success) {
        onClose();
        toast.success(message);
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error("Error adding product");
    }
    setSubmitting(false);
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
          {({ setFieldValue }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="productName"
                  className="block text-md font-medium text-gray-700"
                >
                  Product Name
                </label>
                <Field
                  name="productName"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
                <ErrorMessage
                  name="productName"
                  component="div"
                  className="text-red-500 text-md mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="wsCode"
                  className="block text-md font-medium text-gray-700"
                >
                  WS Code
                </label>
                <Field
                  name="wsCode"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
                <ErrorMessage
                  name="wsCode"
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
                    className="mt-1 block border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-md mt-1"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="packageSize"
                    className="block text-md font-medium text-gray-700"
                  >
                    Package Size
                  </label>
                  <Field
                    name="packageSize"
                    type="text"
                    className="mt-1 block border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                  />
                  <ErrorMessage
                    name="packageSize"
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
                  Upload Images
                </label>
                <input
                  name="images"
                  type="file"
                  multiple
                  className="mt-1 block w-full text-md text-gray-500"
                  onChange={(event) => {
                    setFieldValue("images", event.currentTarget.files);
                  }}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-md font-medium text-gray-700"
                >
                  Category
                </label>
                <Field
                  as="select"
                  name="category"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home</option>
                </Field>
                <ErrorMessage
                  name="category"
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
                <Field
                  as="select"
                  name="tags"
                  multiple
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                >
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="popular">Popular</option>
                </Field>
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
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductForm;
