import { FiMail, FiPhone, FiMapPin, FiShield, FiUserCheck, FiCheckCircle, FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";

export const TableRow = ({ user, onEdit, onDelete, index }) => {
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
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">{user.name}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">#{user._id?.slice(-8).toUpperCase()}</p>
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
            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
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