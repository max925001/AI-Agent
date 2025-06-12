import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateAssistant, getUserData } from '../redux/slices/authSlice'; // Adjust the path as needed

const Customize2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const { selectedAssistant } = location.state || userData?.assistanceImage || '';
  console.log(selectedAssistant)
   // Fetch user data from Redux state
  const [assistantName, setAssistantName] = useState(userData?.aiassistanceName || '');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data when the component mounts
  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  // Set the image preview
  useEffect(() => {
    if (selectedAssistant?.imagePreview) {
      setImagePreview(selectedAssistant.imagePreview);
    }
  }, [selectedAssistant]);

  const handleCreateAssistant = () => {
    if (!assistantName.trim()) {
      console.log('Please enter a name for your assistant.');
      return;
    }

    const formData = new FormData();
    formData.append('aiassistanceName', assistantName);
    if (selectedAssistant?.id === 'new' && selectedAssistant?.image instanceof File) {
      
      formData.append('image', selectedAssistant.image);
    } else if (selectedAssistant?.image) {
    
      formData.append('assistanceImage', selectedAssistant.image);
    }

    setLoading(true);
    dispatch(updateAssistant(formData))
      .unwrap()
      .then(() => {
        dispatch(getUserData()); 
        navigate('/');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error updating assistant:', error);
        setLoading(false);
      });
  };

  const handleNameChange = (e) => {
    setAssistantName(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  if (!selectedAssistant || selectedAssistant === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 to-indigo-900 flex items-center justify-center">
        <p className="text-white text-lg sm:text-xl lg:text-2xl font-semibold">
          No assistant selected. Please go back and select an assistant.
        </p>
      </div>
    );
  }

  const hasAssistantName = !!userData?.aiassistanceName; // Check if assistant name exists
  const showCreateButton = hasAssistantName || assistantName.trim(); // Show button if name exists or user has entered a name

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-indigo-900 flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 relative">
      {/* Back Arrow Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 cursor-pointer left-4 p-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all duration-300"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-8 lg:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-lg">
        Customize Your AI Assistant
      </h2>
      <div className="w-full max-w-[300px] bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-xl shadow-md p-4 sm:p-6">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="AI Assistant"
            className="w-full max-h-24 xs:max-h-28 sm:max-h-32 lg:max-h-40 xl:max-h-44 object-contain rounded-lg mx-auto"
          />
        )}
        <div className="mt-4">
          <input
            type="text"
            value={assistantName}
            onChange={handleNameChange}
            placeholder="Enter assistant name"
            className="w-full px-3 py-2 text-sm xs:text-base sm:text-lg text-white bg-gray-900/50 border border-orange-400/30 rounded-lg focus:outline-none focus:border-orange-600 placeholder-gray-400"
          />
          {assistantName && (
            <p className="text-sm xs:text-base sm:text-lg font-semibold text-white text-center mt-2 drop-shadow-sm">
              {assistantName}
            </p>
          )}
        </div>
      </div>
      {showCreateButton && (
        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          <button
            disabled={loading}
            onClick={handleCreateAssistant}
            className={`px-6 sm:px-8 py-2 sm:py-3 cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-full shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Loading...' : 'Create Your Assistant'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Customize2;