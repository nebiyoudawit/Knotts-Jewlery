import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiX } from "react-icons/fi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const UserManagment = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Error fetching users:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userToDelete));
      } else {
        console.error("Error deleting user:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleSave = async (userData) => {
    setSaving(true);
    try {
      if (currentUser) {
        const response = await fetch(
          `${API_BASE_URL}/users/${currentUser._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(userData),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          setUsers(
            users.map((u) => (u._id === currentUser._id ? resData.user : u))
          );
        } else {
          console.error("Error updating user:", response.statusText);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const resData = await response.json();
          setUsers([...users, resData.user]);
        } else {
          console.error("Error adding user:", response.statusText);
        }
      }

      setIsModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 mt-1">Manage all registered users in the system</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
            />
          </div>
          <button
            onClick={() => {
              setCurrentUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#05B171] hover:bg-[#048a5b] text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <FiPlus className="text-lg" /> Add User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05B171]"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#05B171] to-[#0D8C6A] flex items-center justify-center text-white">
                              <FiUser className="text-lg" />
                            </div>
                            <span className="font-medium text-gray-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {currentUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <UserForm
              user={currentUser}
              onSave={handleSave}
              onCancel={() => setIsModalOpen(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                <p className="text-gray-600 mt-1">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05B171] to-[#0D8C6A] flex items-center justify-center text-white flex-shrink-0">
            <FiUser className="text-lg" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 truncate">{user.name}</h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onDelete(user._id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all ${isExpanded ? 'transform rotate-180' : ''}`}
          >
            <FiChevronDown />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Role:</span>
            <span className={`font-medium ${
              user.role === "admin" ? "text-purple-600" : "text-blue-600"
            }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Joined:</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const UserForm = ({ user, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    role: 'customer',
    password: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    setFormData(user || {
      name: '',
      email: '',
      role: 'customer',
      password: '',
      address: '',
      phone: ''
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
            required
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
            required
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all appearance-none bg-white"
            disabled={saving}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
            disabled={saving}
          />
        </div>

        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#05B171] focus:border-[#05B171] outline-none transition-all"
              required
              disabled={saving}
            />
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#05B171] text-white rounded-lg hover:bg-[#048a5b] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserManagment;