import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiShoppingBag } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser, updateUserProfile } = useShop();

  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '********',
  });

  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        password: '********',
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(user); // calls API via context
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  const submitPasswordChange = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to change password');

      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '' });
      setShowPasswordFields(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
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

          {/* Main Profile Area */}
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

              {/* Profile Fields */}
              <div className="space-y-4">
                {/* Name */}
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

                {/* Email */}
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

                {/* Phone */}
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

                {/* Address */}
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

                {/* Password Section */}
                <div className="flex items-center gap-4 p-4">
                  <FiLock className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Password</p>
                    {showPasswordFields ? (
                      <div className="space-y-2">
                        <input
                          type="password"
                          name="currentPassword"
                          placeholder="Current Password"
                          value={passwords.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="password"
                          name="newPassword"
                          placeholder="New Password"
                          value={passwords.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={submitPasswordChange}
                            className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b]"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordFields(false);
                              setPasswords({ currentPassword: '', newPassword: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.password}</p>
                        <button
                          onClick={() => setShowPasswordFields(true)}
                          className="text-[#05B171] text-sm font-medium hover:underline"
                        >
                          Change Password
                        </button>
                      </div>
                    )}
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
