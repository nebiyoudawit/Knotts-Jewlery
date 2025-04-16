import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

const Register = () => {

    return(
            <div className="min-h-[100%] bg-gray-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-[-10px] text-center text-3xl font-extrabold text-gray-900">
                  Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Already have an account?
                  <Link 
                    to="/login" 
                    className="font-medium text-[#05B171] hover:text-[#048a5b]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
        
              <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
                  <form className="space-y-6" >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-[#05B171] focus:border-[#05B171]"
                        />
                      </div>
                    </div>
        
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-[#05B171] focus:border-[#05B171]"
                        />
                      </div>
                    </div>
        
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength="6"
                          className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-[#05B171] focus:border-[#05B171]"
                        />
                      </div>
                    </div>
        
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-[#05B171] focus:border-[#05B171]"
                        />
                      </div>
                    </div>
        
                    <div>
                      <button
                        type="submit"
                            className={'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#05B171] hover:bg-[#048a5b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#05B171]'}
                        >SignUp
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          );
    

}

export default Register;