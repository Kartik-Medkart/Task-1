import { get } from "lodash";
import { getAllOrdersAPI, updateOrderStatusAPI } from "../../services/api";
import React, { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getOrderStatusClass = (order_status) => {
  switch (order_status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const itemsPerPage = 5;

  const [Orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrdersAPI();
        const { data } = response;
        data.orders.sort((a, b) => b.order_id - a.order_id);
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatusAPI(orderId, newStatus);
      const { data, message, success } = response;
      if (success) {
        toast.success(message);
        setOrders((orders) =>
          orders.map((order) =>
            order.order_id == orderId
              ? {
                  ...order,
                  order_status: newStatus,
                  delivered_date:
                    newStatus === "delivered"
                      ? new Date().toISOString().split("T")[0]
                      : order.delivered_date,
                }
              : order
          )
        );
        setEditingOrder(null);
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const filteredOrders = Orders.filter((order) =>
    filter === "all" ? true : order.order_status === filter
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const EditStatusModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Update Order Status - {order.order_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => updateOrderStatus(order.order_id, status)}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                  order.order_status === status
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );

  const FilterComponent = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Status:
      </label>
      <div className="flex gap-4">
        {["all", "pending", "confirmed", "delivered"].map((status) => (
          <label key={status} className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value={status}
              checked={filter === status}
              onChange={(e) => setFilter(e.target.value)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 capitalize">{status}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Order Details - {order.order_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p>
              <span className="font-medium">Name:</span> {order.user.username}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.user.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.user.phone}
            </p>
            <p>
              <span className="font-medium">Address:</span> {order.user.address}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Information</h3>
            <p>
              <span className="font-medium">Total Amount:</span> $
              {order.cart.amount}
            </p>
            <p>
              <span className="font-medium">Status:</span>
              <span
                className={`px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full
                ${
                  order.order_status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.order_status === "confirmed"
                    ? "bg-blue-100 text-blue-800"
                    : order.order_status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {order.order_status}
              </span>
            </p>
            <p>
              <span className="font-medium">Shipping Date:</span>{" "}
              {formatDate(order.shipping_date)}
            </p>
            <p>
              <span className="font-medium">Delivered Date:</span>{" "}
              {formatDate(order.delivered_date) || "-"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Products Details</h3>
          <div className="grid grid-cols-2 gap-4">
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
  );

  const OrderTableComponent = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shipping Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Delivered Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {order.order_id}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {order.user.username}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                ${order.cart.amount}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${
                   getOrderStatusClass(order.order_status)
                  }`}
                >
                  {order.order_status}
                </span>
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {formatDate(order.shipping_date)}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {formatDate(order.delivered_date) || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingOrder(order);
                  }}
                >
                  <FiEdit2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const PaginationComponent = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
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
              {Math.min(indexOfLastItem, filteredOrders.length)}
            </span>{" "}
            of <span className="font-medium">{filteredOrders.length}</span>{" "}
            results
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Order Management
        </h1>
        <FilterComponent />
        <OrderTableComponent />
        <PaginationComponent />
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
        {editingOrder && (
          <EditStatusModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
