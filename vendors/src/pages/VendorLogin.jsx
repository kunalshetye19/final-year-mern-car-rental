import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapPin } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VendorLogin = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Vendor Login
        const response = await axios.post('http://localhost:5000/api/vendors/login', {
          email: formData.email,
          password: formData.password
        });

        if (response.data?.data?._id) {
          onLogin(response.data.data._id, response.data.data.name);
          toast.success('Login successful!');
        } else if (response.data?._id) {
          onLogin(response.data._id, response.data.name);
          toast.success('Login successful!');
        }
      } else {
        // Vendor Registration
        const response = await axios.post('http://localhost:5000/api/vendors/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        });

        if (response.data?.data?._id) {
          onLogin(response.data.data._id, response.data.data.name);
          toast.success('Registration successful!');
        } else if (response.data?._id) {
          onLogin(response.data._id, response.data.name);
          toast.success('Registration successful!');
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Operation failed';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
            KARZONE
          </h1>
          <p className="text-gray-400 text-sm">Vendor Portal</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white text-center">
              {isLogin ? 'Vendor Login' : 'Vendor Registration'}
            </h2>
            <p className="text-gray-400 text-center text-sm mt-2">
              {isLogin ? 'Welcome back to your portal' : 'Create your vendor account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Registration-only fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-orange-400" />
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter vendor name"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-orange-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FaMapPin className="w-4 h-4 mr-2 text-orange-400" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your business address"
                    rows="3"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                  />
                </div>
              </>
            )}

            {/* Email field - always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2 text-orange-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendor@example.com"
                required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* Password field - always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaLock className="w-4 h-4 mr-2 text-orange-400" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    phone: '',
                    address: ''
                  });
                }}
                className="text-orange-400 hover:text-orange-300 font-semibold transition"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-8 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
          <p className="text-gray-300 text-sm">
            This is the <span className="text-orange-400 font-semibold">Vendor Portal</span>. 
          </p>
        </div>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
};

export default VendorLogin;
