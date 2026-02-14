import { FiUsers } from "react-icons/fi";

export const EmptyState = () => (
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