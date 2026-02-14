import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";

export const UserCard = ({ user, onEdit, onDelete }) => {
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
                {user.name?.charAt(0).toUpperCase()}
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
                {user.role?.toUpperCase()}
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