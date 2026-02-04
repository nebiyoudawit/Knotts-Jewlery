import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiShoppingBag,
  FiEdit2,
  FiCheck,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { currentUser, updateUserProfile } = useShop();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "********",
  });

  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        password: "********",
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
    setSavingProfile(true);
    try {
      await updateUserProfile(user);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPasswordChange = async () => {
    setChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to change password");

      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "" });
      setShowPasswordFields(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/40 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-gradient-to-br from-teal-100/20 to-cyan-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-[1]">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-[#05B171] transition-colors">
                Home
              </Link>
              <FiChevronRight className="h-4 w-4" />
              <span className="text-[#05B171] font-medium">Profile</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Compact and Aligned Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-full lg:w-72 lg:shrink-0"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden lg:sticky lg:top-24">
              {/* User Avatar & Info */}
              <div className="bg-gradient-to-br from-[#05B171] to-emerald-600 p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#05B171] text-3xl font-bold shadow-xl mb-3 border-4 border-white/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1 text-center">{user.name}</h3>
                  <p className="text-sm text-emerald-50 text-center">{user.email}</p>
                </div>
              </div>

              {/* Navigation - Compact */}
              <nav className="p-4 space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-[#05B171] border border-emerald-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-[#05B171] to-emerald-600 rounded-lg flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">Profile Settings</span>
                  </div>
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#05B171] rounded-full"></div>
                  </div>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all group"
                >
                  <div className="w-9 h-9 bg-gray-100 group-hover:bg-emerald-50 rounded-lg flex items-center justify-center transition-colors">
                    <FiShoppingBag className="text-gray-600 group-hover:text-[#05B171] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">My Orders</span>
                    <p className="text-xs text-gray-500">View order history</p>
                  </div>
                  <FiChevronRight className="text-gray-400 group-hover:text-[#05B171] transition-colors" />
                </Link>
              </nav>

              {/* Stats Section */}
              <div className="p-4 border-t border-gray-100">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-3">Account Overview</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member since</span>
                      <span className="text-sm font-medium text-gray-900">2024</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Profile Area - Adjusted to be closer to sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              {/* Header - More Compact */}
              <div className="bg-gradient-to-r from-[#05B171] to-emerald-600 p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      Personal Information
                    </h2>
                    <p className="text-emerald-50/90 text-sm">
                      Update your profile details and password
                    </p>
                  </div>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditMode(false)}
                        className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30"
                        title="Cancel"
                      >
                        <FiX className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={savingProfile}
                        className="px-5 py-2.5 bg-white text-[#05B171] rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30"
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#05B171] border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiCheck className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(true)}
                      className="px-5 py-2.5 bg-white text-[#05B171] rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                      <FiEdit2 className="h-4 w-4" />
                      Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Profile Fields - More Compact Layout */}
              <div className="p-5 sm:p-6 mb-10 lg:mb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group"
                  >
                    <div className="h-full p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <FiUser className="text-white text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                            Full Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              name="name"
                              value={user.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#05B171] focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-medium text-gray-900"
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900 text-base truncate">{user.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="group"
                  >
                    <div className="h-full p-4 rounded-xl border border-gray-200 bg-white hover:border-teal-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <FiMail className="text-white text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                            Email Address
                          </label>
                          {editMode ? (
                            <input
                              type="email"
                              name="email"
                              value={user.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none font-medium text-gray-900"
                              placeholder="Enter your email"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900 text-base truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <div className="h-full p-4 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <FiPhone className="text-white text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                            Phone Number
                          </label>
                          {editMode ? (
                            <input
                              type="tel"
                              name="phone"
                              value={user.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none font-medium text-gray-900"
                              placeholder="Enter your phone"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900 text-base">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Address Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="group"
                  >
                    <div className="h-full p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <FiMapPin className="text-white text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                            Delivery Address
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              name="address"
                              value={user.address}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-medium text-gray-900"
                              placeholder="Enter your address"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900 text-base line-clamp-2">{user.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Password Section - Full Width */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <div className="p-5 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <FiLock className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">Password & Security</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage your account password</p>
                          </div>
                          {!showPasswordFields && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setShowPasswordFields(true)}
                              className="px-4 py-2.5 text-sm bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold flex items-center gap-2 shadow-md shadow-emerald-500/30"
                            >
                              <FiEdit2 className="h-3.5 w-3.5" />
                              Change Password
                            </motion.button>
                          )}
                        </div>

                        {showPasswordFields ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  name="currentPassword"
                                  placeholder="Enter current password"
                                  value={passwords.currentPassword}
                                  onChange={handlePasswordChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-600 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  name="newPassword"
                                  placeholder="Enter new password"
                                  value={passwords.newPassword}
                                  onChange={handlePasswordChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-600 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={submitPasswordChange}
                                disabled={changingPassword}
                                className="px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-semibold disabled:opacity-50 shadow-lg flex items-center gap-2"
                              >
                                {changingPassword ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                  </>
                                ) : (
                                  "Update Password"
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  setShowPasswordFields(false);
                                  setPasswords({
                                    currentPassword: "",
                                    newPassword: "",
                                  });
                                }}
                                className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-600 text-sm">
                              Your password was last changed 30 days ago. For security reasons, we recommend changing your password regularly.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Tips */}
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#05B171] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <FiCheck className="text-white text-xs" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Editing Mode Active</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Make your changes and click "Save Changes" to update your profile. Click the X button to cancel.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;