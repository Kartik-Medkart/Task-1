import { useEffect, useState } from "react";
import { getOrdersAPI } from "../services/api";
import { ClipLoader } from "react-spinners";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { updateUserAPI } from "../services/api";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { FaMinus, FaPlus, FaUser, FaBox, FaTimes } from "react-icons/fa";

const CustomerPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user, setLocalUser, logout} = useAuth();

  const initialValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    phone: user?.phone || "",
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrdersAPI();
        const { data } = response;
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders: ", error.response.message);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Order Details #{order.order_id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-600">Order Status</p>
                <p className="font-semibold capitalize">{order.order_status}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-semibold">${order.total_amount}</p>
              </div>
              <div>
                <p className="text-gray-600">Shipping Date</p>
                <p className="font-semibold">
                  {formatDate(order.shipping_date)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Delivery Date</p>
                <p className="font-semibold">
                  {formatDate(order.delivered_date)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Order Items</h3>
              {order.cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-center space-x-4 border-b pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1595246140608-21d37b3dc2e8";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price: ${item.price}</p>
                  </div>
                  <p className="font-semibold">
                    ${Number(item.price) * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
      const {data, success} = response;
      if(success){
        setLocalUser(data);
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

  const OrderContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <ClipLoader size={150} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          orders?.length > 0 &&
          orders.map((order) => (
            <div
              key={order.order_id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedOrder(order);
                setShowModal(true);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order #{order.order_id}</h3>
                  <p className="text-gray-600">
                    {formatDate(order.shipping_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total_amount}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      order.order_status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {console.log(orders)}
        {orders?.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        )}
      </div>
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
            onClick={() => logout()}
            className={`w-full flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700`}
          >
            <FaBox />
            <span>Log Out</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" ? <ProfileContent /> : <OrderContent />}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerPage;
