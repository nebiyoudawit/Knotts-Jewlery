import { useState, useEffect } from "react";
import { 
  FiUser, FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiX,
  FiMail, FiPhone, FiMapPin, FiShield, FiUserCheck, FiUsers,
  FiMoreVertical, FiDownload, FiFilter, FiRefreshCw, FiCheckCircle,
  FiAlertCircle, FiInfo, FiCalendar, FiClock
} from "react-icons/fi";
import { 
  FaUserCircle, FaUserShield, FaRegUserCircle, FaUserTie,
  FaRegIdCard, FaRegEnvelope, FaRegClock
} from "react-icons/fa";

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

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userToDelete));
        showNotification('success', 'User deleted successfully');
      } else {
        console.error("Error deleting user:", response.statusText);
        showNotification('error', 'Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification('error', 'Failed to delete user');
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
          showNotification('success', 'User updated successfully');
        } else {
          console.error("Error updating user:", response.statusText);
          showNotification('error', 'Failed to update user');
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
          showNotification('success', 'User added successfully');
        } else {
          console.error("Error adding user:", response.statusText);
          showNotification('error', 'Failed to add user');
        }
      }

      setIsModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification('error', 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) => selectedRole === "all" || user.role === selectedRole);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'customer').length,
    newThisMonth: users.filter(u => {
      const date = new Date(u.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 p-4 md:p-8">
      <style>{`
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .stat-card:hover::before {
          opacity: 1;
        }
        
        .table-row-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .table-row {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .avatar-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .avatar-gradient-green {
          background: linear-gradient(135deg, #05B171 0%, #0D8C6A 100%);
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
                Manage and organize all system users
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-12 py-4 w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="stat-card bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{'--accent-color': '#05B171'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50">
                <FiUsers className="text-emerald-600 text-2xl" />
              </div>
              <div className="px-3 py-1 bg-emerald-50 rounded-full">
                <span className="text-emerald-700 text-xs font-semibold">TOTAL</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-sm text-gray-500 font-medium">Registered Users</p>
            </div>
          </div>

          <div className="stat-card bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{'--accent-color': '#8b5cf6'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-50">
                <FaUserShield className="text-purple-600 text-2xl" />
              </div>
              <div className="px-3 py-1 bg-purple-50 rounded-full">
                <span className="text-purple-700 text-xs font-semibold">ADMIN</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.admins}</p>
              <p className="text-sm text-gray-500 font-medium">Administrators</p>
            </div>
          </div>

          <div className="stat-card bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{'--accent-color': '#10b981'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-teal-50">
                <FaRegUserCircle className="text-teal-600 text-2xl" />
              </div>
              <div className="px-3 py-1 bg-teal-50 rounded-full">
                <span className="text-teal-700 text-xs font-semibold">ACTIVE</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.customers}</p>
              <p className="text-sm text-gray-500 font-medium">Customer Accounts</p>
            </div>
          </div>

          <div className="stat-card bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300" style={{'--accent-color': '#f59e0b'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-50">
                <FiClock className="text-amber-600 text-2xl" />
              </div>
              <div className="px-3 py-1 bg-amber-50 rounded-full">
                <span className="text-amber-700 text-xs font-semibold">NEW</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.newThisMonth}</p>
              <p className="text-sm text-gray-500 font-medium">Joined This Month</p>
            </div>
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
                    onClick={() => setSelectedRole("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      selectedRole === "all" 
                        ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setSelectedRole("admin")}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      selectedRole === "admin" 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setSelectedRole("customer")}
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
                onClick={() => {
                  setSelectedRole("all");
                  setSearchTerm("");
                }}
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
                filteredUsers.map((user, index) => (
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
                      filteredUsers.map((user, index) => (
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

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
      <FiUsers className="text-gray-400 text-4xl" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No users found</h3>
    <p className="text-gray-500 text-center max-w-md leading-relaxed">
      We couldn't find any users matching your criteria. Try adjusting your search or filters.
    </p>
  </div>
);

// Enhanced Table Row
const TableRow = ({ user, onEdit, onDelete, index }) => {
  const getAvatarGradient = (role) => {
    if (role === 'admin') return 'avatar-gradient';
    return 'avatar-gradient-blue';
  };
  
  return (
    <tr 
      className="table-row border-b border-gray-100 hover:bg-gray-50/60 transition-all duration-200"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl ${getAvatarGradient(user.role)} flex items-center justify-center text-white shadow-lg`}>
              <span className="text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">{user.name}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">#{user._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <FiMail className="text-gray-400 text-sm flex-shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500">
              <FiPhone className="text-gray-400 text-sm flex-shrink-0" />
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold w-fit shadow-sm ${
            user.role === "admin"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          }`}>
            {user.role === "admin" ? <FiShield className="text-sm" /> : <FiUserCheck className="text-sm" />}
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          {user.isVerified && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <FiCheckCircle className="text-sm" /> Verified Account
            </span>
          )}
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <FiMapPin className="text-gray-400 text-sm flex-shrink-0" />
          <span className="truncate max-w-[180px] font-medium">{user.address || 'Not specified'}</span>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <FiCalendar className="text-gray-400 text-sm flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all group"
            title="Edit user"
          >
            <FiEdit2 className="text-lg group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(user._id)}
            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            title="Delete user"
          >
            <FiTrash2 className="text-lg group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Enhanced User Card for Mobile
const UserCard = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAvatarGradient = (role) => {
    if (role === 'admin') return 'avatar-gradient';
    return 'avatar-gradient-blue';
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all animate-fade-in-up">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl ${getAvatarGradient(user.role)} flex items-center justify-center text-white shadow-lg`}>
              <span className="text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate text-base">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <FiEdit2 className="text-lg" />
          </button>
          <button
            onClick={() => onDelete(user._id)}
            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <FiTrash2 className="text-lg" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all ${
              isExpanded ? 'bg-gray-100 text-gray-700 rotate-180' : ''
            }`}
          >
            <FiChevronDown className="text-lg" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-5 pt-5 border-t-2 border-gray-100 space-y-3 animate-scale-in">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiMail className="text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiPhone className="text-gray-400 flex-shrink-0" />
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiMapPin className="text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium">{user.address || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FiCalendar className="text-gray-400 flex-shrink-0" />
            <span className="font-medium">Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          {user.isVerified && (
            <div className="flex items-center gap-3 text-sm text-emerald-600 font-semibold">
              <FiCheckCircle />
              <span>Verified Account</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced User Form Modal - FIXED VERSION
const UserModal = ({ user, onSave, onClose, saving }) => {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      {/* Modal container with max height and scrolling */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* Modal Header - Fixed at top */}
        <div className="flex justify-between items-center p-8 border-b-2 border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
              {user ? (
                <FiEdit2 className="text-emerald-600 text-2xl" />
              ) : (
                <FiPlus className="text-emerald-600 text-2xl" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {user ? "Edit User Profile" : "Create New User"}
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {user ? "Modify user account details" : "Add a new member to the system"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-all"
            type="button"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Modal Form - Scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-base font-medium"
                    required
                    disabled={saving}
                    placeholder="John Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-base font-medium"
                    required
                    disabled={saving}
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    User Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white appearance-none cursor-pointer text-base font-medium"
                    disabled={saving}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-base font-medium"
                    disabled={saving}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-base font-medium"
                    disabled={saving}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                {!user && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-base font-medium"
                      required={!user}
                      disabled={saving}
                      placeholder="••••••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Must be at least 8 characters with numbers and letters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer - Fixed at bottom */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-8 border-t-2 border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-8 py-3.5 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 font-semibold transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {user ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{user ? 'Save Changes' : 'Create User'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Delete Confirmation Modal
const DeleteConfirmationModal = ({ onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto my-8 animate-scale-in">
      <div className="p-8">
        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mx-auto mb-6">
          <FiAlertCircle className="text-red-600 text-4xl" />
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Confirm Deletion</h3>
          <p className="text-gray-600 leading-relaxed">
            This will permanently remove the user from the system. This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-8 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold transition-all"
            disabled={deleting}
          >
            Keep User
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-lg shadow-red-200/50 hover:shadow-xl flex items-center justify-center gap-2"
            disabled={deleting}
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default UserManagement;