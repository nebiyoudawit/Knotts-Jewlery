import { useState, useEffect } from "react";
import { 
  FiUsers, FiPlus, FiSearch, FiX, FiFilter, FiRefreshCw,
  FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight
} from "react-icons/fi";

import { EmptyState } from "./EmptyState";
import { TableRow } from "./TableRow";
import { UserCard } from "./UserCard";
import { UserModal } from "./UserModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole]); // Removed searchTerm from dependencies - we'll handle search differently

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(selectedRole !== 'all' && { role: selectedRole })
      });

      // Add search param if exists
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/users?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Your backend returns array of users directly
        setUsers(data);
        // Calculate total pages based on response length
        // Since your backend doesn't return pagination metadata yet,
        // we'll assume all users are returned and do client-side pagination
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } else {
        console.error("Error fetching users:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side pagination since your backend returns all users
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter users client-side based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

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

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh users list
        await fetchUsers();
        showNotification('success', 'User deleted successfully');
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } else {
        showNotification('error', data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification('error', 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (userData) => {
    setSaving(true);
    try {
      let response;
      if (currentUser) {
        // Update existing user
        response = await fetch(`${API_BASE_URL}/users/${currentUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(userData),
        });
      } else {
        // Add new user
        response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(userData),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh users list
        await fetchUsers();
        showNotification('success', currentUser ? 'User updated successfully' : 'User added successfully');
        setIsModalOpen(false);
        setCurrentUser(null);
      } else {
        showNotification('error', data.message || 'Failed to save user');
      }
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification('error', 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setSelectedRole("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination component
  const Pagination = () => {
    const totalFilteredUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalFilteredUsers / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-4 bg-white border-t-2 border-gray-100 sm:px-6">
        <div className="flex items-center text-sm text-gray-500">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalFilteredUsers)} of {totalFilteredUsers} users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl border-2 transition-all ${
              currentPage === 1
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show current page, first, last, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-emerald-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
              }
              return null;
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl border-2 transition-all ${
              currentPage === totalPages
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 p-4 md:p-8">
      <style>{`
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        
        .avatar-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .avatar-gradient-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
      `}</style>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-white text-emerald-900 border-2 border-emerald-500' 
            : 'bg-white text-red-900 border-2 border-red-500'
        }`}>
          <div className={`p-1.5 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {notification.type === 'success' ? 
              <FiCheckCircle className="text-emerald-600 text-xl" /> : 
              <FiAlertCircle className="text-red-600 text-xl" />
            }
          </div>
          <span className="font-medium text-sm">{notification.message}</span>
          <button 
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#05B171] to-emerald-600 shadow-lg shadow-emerald-200">
                  <FiUsers className="text-white text-xl" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  User Management
                </h1>
              </div>
              <p className="text-base text-gray-500 ml-16">
                Manage and organize all system users • {users.length} total users
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                  showFilters 
                    ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <FiFilter className="text-lg" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#05B171] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl font-medium"
              >
                <FiPlus className="text-xl" /> 
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-14 pr-12 py-4 w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm text-base"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange({ target: { value: '' } })}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-sm animate-scale-in">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Role Filter</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRoleFilter("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      selectedRole === "all" 
                        ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => handleRoleFilter("admin")}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      selectedRole === "admin" 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => handleRoleFilter("customer")}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      selectedRole === "customer" 
                        ? 'bg-teal-600 text-white shadow-lg' 
                        : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                    }`}
                  >
                    Customers
                  </button>
                </div>
              </div>
              <button 
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors"
              >
                <FiRefreshCw className="text-base" /> Clear All
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-gray-100">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-emerald-600"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-50 opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.length === 0 ? (
                <EmptyState />
              ) : (
                paginatedUsers.map((user, index) => (
                  <div key={user._id} style={{animationDelay: `${index * 50}ms`}}>
                    <UserCard
                      user={user}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        User
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Contact Info
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Access Level
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Location
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Member Since
                      </th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-16 text-center">
                          <EmptyState />
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <TableRow 
                          key={user._id} 
                          user={user} 
                          onEdit={handleEdit} 
                          onDelete={handleDeleteClick}
                          index={index}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredUsers.length > 0 && <Pagination />}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <UserModal
          user={currentUser}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          saving={saving}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default UserManagement;