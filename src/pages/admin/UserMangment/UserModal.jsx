import { useState, useEffect } from "react";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";

export const UserModal = ({ user, onSave, onClose, saving }) => {
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
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