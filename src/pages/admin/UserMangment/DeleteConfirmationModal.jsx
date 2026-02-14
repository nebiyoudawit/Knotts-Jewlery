import { FiAlertCircle } from "react-icons/fi";

export const DeleteConfirmationModal = ({ onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto animate-scale-in">
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