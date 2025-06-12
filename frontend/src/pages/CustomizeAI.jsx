import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


// Define AI assistants with placeholder images
const assistants = [
  { id: 1, image:'https://res.cloudinary.com/dz6c061ci/image/upload/v1749747264/WhatsApp_Image_2025-06-12_at_22.19.40_nvi6wb.jpg'},
  { id: 3, image: 'https://res.cloudinary.com/dz6c061ci/image/upload/v1748449128/image1_jekknm.png' },
  { id: 4, image: 'https://res.cloudinary.com/dz6c061ci/image/upload/v1748449113/image5_wdno6d.png' },
  { id: 5, image: 'https://res.cloudinary.com/dz6c061ci/image/upload/v1749747137/WhatsApp_Image_2025-06-12_at_22.18.11_iguemh.jpg' },
  { id: 6, image: 'https://res.cloudinary.com/dz6c061ci/image/upload/v1748449032/image6_orzao9.jpg' },
  { id: 'new', image: null }, // Placeholder for custom AI
];

const CustomizeAI = () => {
  const navigate = useNavigate();
  const [customImage, setCustomImage] = useState(null); // Store the File object
  const [customImagePreview, setCustomImagePreview] = useState(null); // Store the preview URL
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const fileInputRef = useRef(null);

  const handleCardClick = (assistant) => {
    if (assistant.id === 'new' && !customImage) {
      // Trigger file input for custom AI if no image is uploaded
      fileInputRef.current.click();
    } else {
      // Select the assistant and store its id and image
      setSelectedAssistant({
        id: assistant.id,
        image: assistant.id === 'new' ? customImage : assistant.image,
        imagePreview: assistant.id === 'new' ? customImagePreview : assistant.image,
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Store the file object and create a preview URL
      setCustomImage(file);
      const imageUrl = URL.createObjectURL(file);
      setCustomImagePreview(imageUrl);
      // Automatically select the custom AI card after uploading
      setSelectedAssistant({
        id: 'new',
        image: file, // Store the File object
        imagePreview: imageUrl, // Store the preview URL
      });
    }
  };

  const handleNextClick = () => {
    if (selectedAssistant) {
      // Navigate to Customize2 page with selectedAssistant data
      navigate('/customize2', { state: { selectedAssistant } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-indigo-900 scrollbar-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-8 lg:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-lg">
          Choose or Create Your AI Assistant
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 justify-items-center">
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className={`w-full max-w-[300px] bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl border ${selectedAssistant?.id === assistant.id ? 'border-orange-800 border-4' : 'border-orange-400/20'} hover:border-orange-400/50 transform hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden`}
              onClick={() => handleCardClick(assistant)}
            >
              <div className="p-2 xs:p-3 sm:p-4">
                {assistant.id === 'new' && !customImage ? (
                  <div className="w-full max-h-24 xs:max-h-28 sm:max-h-32 lg:max-h-40 xl:max-h-44 flex items-center justify-center bg-black/50">
                    <svg
                      className="w-10 xs:w-12 sm:w-14 lg:w-16 h-10 xs:h-12 sm:h-14 lg:h-16"
                      fill="url(#plus-gradient)"
                      stroke="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="plus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#fdba74', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={assistant.id === 'new' ? customImagePreview : assistant.image}
                    alt="AI Assistant"
                    className="w-full max-h-24 xs:max-h-28 sm:max-h-32 lg:max-h-40 xl:max-h-44 object-contain rounded-lg"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedAssistant && (
          <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
            <button
              onClick={handleNextClick}
              className="px-6 sm:px-8 py-2 sm:py-3 cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-full shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all duration-300"
            >
              Next
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default CustomizeAI;