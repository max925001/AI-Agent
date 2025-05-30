import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserData, logout, askAssistant, clearAssistantResponse } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.data);
  const assistantResponse = useSelector((state) => state.auth.assistantResponse);
  console.log('Assistant response:', assistantResponse);
  const assistantLoading = useSelector((state) => state.auth.assistantLoading);
  const [speechError, setSpeechError] = useState(null);
  const [speechSynthesisError, setSpeechSynthesisError] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Track if audio is enabled

  useEffect(() => {
    console.log('Fetching user data...');
    dispatch(getUserData())
      .unwrap()
      .catch((error) => {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data. Please try again.');
      });
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearAssistantResponse());
    return () => {
      dispatch(clearAssistantResponse());
      window.speechSynthesis.cancel();
    };
  }, [dispatch]);

  const username = userData?.name || 'User';
  const assistantName = userData?.aiassistanceName || 'Your Assistant';
  const assistantImage = userData?.assistanceImage || 'https://via.placeholder.com/150';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // this is a class
    // window.SpeechRecognition use for window and window.webkitSpeechRecognition use for browser
    if (!SpeechRecognition) {
      toast.error('Speech Recognition is not supported in this browser. Please use a supported browser like Chrome.');
      setSpeechError('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition(); // create a object of SpeechRecognition
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  

    recognition.onresult = async(event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log('Recognized speech:', transcript);
      const ans =transcript.toLowerCase().includes(userData?.aiassistanceName.toLowerCase())
      console.log("ans",ans)
      if(transcript.toLowerCase().includes(userData?.aiassistanceName.toLowerCase())) {

         setSpeechError(null);
      if (true) {
        const command = transcript.toLowerCase();
        
        if (command.includes('logout')) {
          speak('Logging you out.');
          handleLogout();
          return;
        }
       
        if (command.includes('customize' || 'customise')) {
          speak('Opening customization page.');
          handleCustomize();
          return;
        }
        handleCommandSubmit(transcript);
      }
      }
     
    };

    

   

    

    recognition.start();
  }, []);

 

 

  useEffect(() => {
    console.log('assistantResponse updated:', assistantResponse);
    if (assistantResponse) {
      if (assistantResponse.response) {
        const responseText = assistantResponse.response;
        console.log('Response text:', responseText);
        speak(responseText);
        if(assistantResponse?.data?.type==='link'){
          console.log("open new window ")
          console.log(assistantResponse?.data?.value)
         handleCommand(assistantResponse?.data?.value)

        }
        
      } else {
        console.warn('No response field in assistantResponse:', assistantResponse);
        speak('I encountered an issue. Please try again.');
      }
    }
  }, [assistantResponse, isAudioEnabled]);

const speak = (text, language = 'en-US') => {
    console.log("texting", text);
    if (!text) {
      console.warn('No text provided to speak');
      return;
    }

    console.log('Speaking:', text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language; // Set the desired language

    const voices = window.speechSynthesis.getVoices();
    console.log(voices);
    let selectedVoice = voices.find(voice => voice.lang === language);

    if (!selectedVoice) {
      const langCode = language.split('-')[0];
      selectedVoice = voices.find(voice => voice.lang.includes(langCode));
    }

    if (!selectedVoice) {
      console.warn(`No voice found for language ${language}. Using any available voice.`);
      selectedVoice = voices[0];
      if (selectedVoice) {
        utterance.lang = selectedVoice.lang;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name);
    } else {
      console.warn('No voices available. Speech synthesis may not work.');
    }

    window.speechSynthesis.speak(utterance);
};

const handleCommand = (data) =>{
  console.log("data",data)
 window.open(data,'_blank')
}

  const handleCommandSubmit = async (commandToSend) => {
    if (!commandToSend || !commandToSend.trim()) {
      speak('I didn’t hear a command. Please try again.');
      return;
    }

    dispatch(askAssistant(commandToSend))
      .unwrap()
      .catch((error) => {
        console.error('Error asking assistant:', error);
        speak('I encountered an error while processing your request. Please try again.');
      });
  };

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleCustomize = () => {
    navigate('/customizeai');
  };

  const clearResponse = () => {
    dispatch(clearAssistantResponse());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-indigo-900 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
      <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 sm:mb-8 lg:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-lg">
        Welcome Back!
      </h1>

      <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-500">
        <div className="flex justify-center">
          <img
            src={assistantImage}
            alt={assistantName}
            className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover rounded-full border-4 border-orange-400/50 shadow-lg"
          />
        </div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-center mt-4 sm:mt-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-sm">
          {assistantName}
        </h2>
        <p className="text-sm xs:text-base sm:text-lg text-gray-300 text-center mt-2 sm:mt-3">
          Your personalized AI companion is ready to assist you! Speak your command to interact.
        </p>
      </div>

      {speechError && (
        <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] mt-6 bg-red-900/80 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
          <p className="text-sm xs:text-base sm:text-lg text-center text-red-300">
            {speechError}
          </p>
        </div>
      )}

      {speechSynthesisError && (
        <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] mt-6 bg-red-900/80 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
          <p className="text-sm xs:text-base sm:text-lg text-center text-red-300">
            {speechSynthesisError}
          </p>
          {assistantResponse?.response && (
            <p className="text-sm xs:text-base sm:text-lg text-center text-gray-300 mt-2">
              Response: {assistantResponse.response}
            </p>
          )}
        </div>
      )}

      {assistantResponse && !speechSynthesisError && (
        <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] mt-6 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
          <p className={`text-sm xs:text-base sm:text-lg text-center ${assistantResponse.intent === 'error' || assistantResponse.intent === 'unknown' ? 'text-red-400' : 'text-gray-300'}`}>
            {assistantResponse.response}
          </p>
          {assistantResponse.data?.type === 'link' && (
            <div className="flex justify-center mt-4">
              <a
                href={assistantResponse.data.value}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all duration-300"
              >
                Open Link
              </a>
            </div>
          )}
          <button
            onClick={clearResponse}
            className="mt-4 text-gray-400 underline text-sm sm:text-base"
          >
            Clear Response
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 lg:mt-10">
        <button
          onClick={handleCustomize}
          disabled={assistantLoading}
          className={`px-6 sm:px-8 py-2 sm:py-3 cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-full shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 ${assistantLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Customize Your Assistant
        </button>
        <button
          onClick={handleLogout}
          disabled={assistantLoading}
          className={`px-6 sm:px-8 py-2 sm:py-3 cursor-pointer bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-full shadow-lg hover:shadow-xl hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all duration-300 ${assistantLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;