import { useEffect, useState } from "react";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserAPI } from "../../services/api";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { FaMinus, FaPlus, FaUser, FaBox, FaTimes } from "react-icons/fa";

import Orders from "./Orders";
import Products from "./Products";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const {user, logout} = useAuth();

  const initialValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    phone: user?.phone || "",
  }

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone : Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits').required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
  });

  const handleSubmit = async(values, { setSubmitting }) => {
    const {email, ...userData} = values;
    try{
      const response = await updateUserAPI(userData);
      const {data, success} = response.data;
      if(success){
        toast.success('Profile updated successfully');
      }
    }
    catch(error){
      console.error('Error updating profile: ', error);
      toast.error('Error updating profile');
    }
    setSubmitting(false);
  };

  const ProfileContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-2">First Name</label>
              <Field
                type="text"
                name="firstName"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="firstName"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Last Name</label>
              <Field
                type="text"
                name="lastName"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Email</label>
              <Field
                type="email"
                name="email"
                className="w-full p-2 border rounded-md"
                readOnly
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Phone Number</label>
              <Field
                type="phone"
                name="phone"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Address</label>
              <Field
                type="text"
                name="address"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="address"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">City</label>
              <Field
                type="text"
                name="city"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="city"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">State</label>
              <Field
                type="text"
                name="state"
                className="w-full p-2 border rounded-md"
              />
              <ErrorMessage
                name="state"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );

  

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs for mobile */}
        <div className="md:hidden flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaUser />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaBox />
            <span>Orders</span>
          </button>
        </div>

        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaUser />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaBox />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === "products"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaBox />
            <span>Products</span>
          </button>
          <button
            onClick={() => logout()}
            className={`w-full flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700`}
          >
            <FaBox />
            <span>Log Out</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileContent />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "products" && <Products />}
        </div>
      </div>

      {/* Order Details Modal
      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
        />
      )} */}
    </div>
  );
};

export default AdminPage;
