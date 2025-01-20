import React, { useState, useEffect } from "react";
import {
  searchUsersAPI,
  updateUserRoleAPI,
//   deleteUserAPI,
} from "../../services/api";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import PaginationComponent from "../../components/PaginationComponent";
import ConfirmationModal from "../../components/ConfirmationModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 8;

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [updatedRole, setUpdatedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [isModelOpen, setIsModelOpen] = useState(false);

  const { user, role } = useAuth();
  const currentUser = user;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await searchUsersAPI(
          search,
          selectedRole,
          currentPage,
          itemsPerPage
        );
        const { data } = response;
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalItems);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      }
    };

    fetchUsers();
  }, [search, selectedRole, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole]);

//   const handleDelete = async (userId) => {
//     try {
//       const response = await deleteUserAPI(userId);
//       const { message } = response;
//       setUsers(users.filter((user) => user.user_id !== userId));
//       toast.success(message);
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       toast.error("Error deleting user");
//     }
//   };

  const updateUserRole = async () => {
    try {
      const response = await updateUserRoleAPI(selectedUser.user_id, updatedRole);
      const { message } = response;
      setUsers(
        users.map((user) => {
          if (user.user_id === selectedUser.user_id) {
            user.role = updatedRole;
          }
          return user;
        })
      );
      toast.success(message);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const EditRoleModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Update Role Status - {user.username}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          {["admin", "customer"].map((role) => (
            <button
              key={role}
              onClick={() => {
                setUpdatedRole(role);
                setIsModelOpen(true);
              }}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                user.role === role
                  ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Users</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center justify-center w-xl md:w-1/2 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search Users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {role == "superadmin" && (
              <div className="w-full md:w-1/2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {["customer", "admin", "superadmin"].map((role, index) => (
                    <option key={index} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="group p-4 border border-gray-300 rounded-lg"
            >
              <h3 className="text-lg font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-gray-500">Total Orders: {user.orderCount}</p>
              {role == "superadmin" && currentUser.user_id !== user.user_id && (
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                        console.log(user);
                        setSelectedUser(user)
                    }}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <ConfirmationModal
          isOpen={isModelOpen}
          message={"Are You Sure You Want to Change Role of this User?"}
          onConfirm={()=> {
            updateUserRole();
            setSelectedUser(null);
            setIsModelOpen(false);
          }}
          onCancel={()=> {
            setSelectedUser(null);
            setIsModelOpen(false)
         }}
        />

        {selectedUser && (
          <EditRoleModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
        <PaginationComponent
          currentPage
          totalPages
          totalItems={totalUsers}
          itemsPerPage
          setCurrentPage
        />
      </div>
    </div>
  );
};

export default Users;
