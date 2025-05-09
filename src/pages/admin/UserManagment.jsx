import { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5000/api/admin'; // Update base URL

const UserManagment = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with how you store the token
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
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

const handleDelete = async (id) => {
  try {
    // Ensure id is being passed correctly
    console.log("Deleting user with id:", id);

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      setUsers(users.filter(u => u.id !== id)); // Remove user from the list
    } else {
      console.error("Error deleting user:", response.statusText);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

  const handleSave = async (userData) => {
    // If editing an existing user
    if (currentUser) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(userData),
        });
  
        if (response.ok) {
          const updatedUser = await response.json();
          setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        } else {
          console.error("Error updating user:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
    } else {
      // If adding a new user
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(userData), // Ensure the userData is correct
        });
  
        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]); // Add new user to the list
        } else {
          console.error("Error adding user:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding user:", error);
      }
    }
    setIsModalOpen(false);
    setCurrentUser(null); // Clear current user after save
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171] w-full"
            />
          </div>
          <button 
            onClick={() => { setCurrentUser(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-[#05B171] text-white px-4 py-2 rounded hover:bg-[#048a5b] w-full md:w-auto"
          >
            <FiPlus /> Add User
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map(user => (
          <UserCard 
            key={user.id} 
            user={user} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#05B171] flex items-center justify-center text-white">
                      <FiUser />
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.joined}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button 
                    onClick={() => handleEdit(user.id)} 
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{currentUser ? 'Edit User' : 'Add New User'}</h3>
            <UserForm 
              user={currentUser} 
              onSave={handleSave} 
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#05B171] flex items-center justify-center text-white">
            <FiUser />
          </div>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(user)} 
            className="text-blue-600 hover:text-blue-900 p-1"
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={() => onDelete(user.id)} 
            className="text-red-600 hover:text-red-900 p-1"
          >
            <FiTrash2 />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Role: {user.role}</p>
          <p>Joined: {user.joined}</p>
        </div>
      )}
    </div>
  );
};
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    role: 'customer',
    password: ''
  });

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
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required={!user}
            />
          </div>
        )}
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] mb-2 sm:mb-0"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};
export default UserManagment;
