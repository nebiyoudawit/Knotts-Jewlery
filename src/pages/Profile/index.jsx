import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock,FiShoppingBag } from 'react-icons/fi';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+251 912 345 678',
    address: 'Bole Road, Addis Ababa',
    password: '********'
  });

  const [editMode, setEditMode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
    // Here you would typically call an API to update user data
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#05B171] flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                to="/profile"
                className="w-full text-left px-4 py-3 rounded-md flex items-center gap-3 bg-[#05B171] text-white"
              >
                <FiUser className="text-lg" />
                <span>Profile</span>
              </Link>
              <Link
                to="/orders"
                className="w-full text-left px-4 py-3 rounded-md flex items-center gap-3 hover:bg-gray-100"
              >
                <FiShoppingBag className="text-lg" />
                <span>My Orders</span>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                {editMode ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b]"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <FiUser className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="font-medium">{user.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <FiMail className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email Address</p>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="font-medium">{user.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <FiPhone className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={user.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="font-medium">{user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <FiMapPin className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Address</p>
                    {editMode ? (
                      <input
                        type="text"
                        name="address"
                        value={user.address}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="font-medium">{user.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4">
                  <FiLock className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.password}</p>
                      <button className="text-[#05B171] text-sm font-medium hover:underline">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;