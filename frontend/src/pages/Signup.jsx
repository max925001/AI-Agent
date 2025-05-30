import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAccount } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AIbackgroundImage from '../assets/AIBg.jpg';

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await dispatch(createAccount(formData)).unwrap();
      if (result.success) {
        navigate('/customizeai');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat backdrop-blur-sm"
        style={{ backgroundImage: `url(${AIbackgroundImage})` }}
      ></div>
      <div className="relative bg-transparent backdrop-blur-md p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-2 xs:mx-3 sm:mx-4 md:mx-6 lg:mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-5 drop-shadow-md">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white drop-shadow-sm">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-white bg-opacity-20 text-black border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white drop-shadow-sm">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-white bg-opacity-20 text-black border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white drop-shadow-sm">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-white bg-opacity-30 text-black border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white drop-shadow-sm">
          Already have an account?{' '}
          <a href="/login" className="text-purple-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;