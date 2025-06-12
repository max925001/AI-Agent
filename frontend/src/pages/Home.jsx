import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserData, logout, askAssistant, clearAssistantResponse } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.data);
  const assistantResponse = useSelector((state) => state.auth.assistantResponse);
  const assistantLoading = useSelector((state) => state.auth.assistantLoading);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  useEffect(() => {
    dispatch(getUserData())
      .unwrap()
      .catch((error) => {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data. Please try again.');
      });

    return () => {
      // Cleanup speech recognition and synthesis
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearAssistantResponse());
    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    if (assistantResponse?.response) {
      speak(assistantResponse.response);
      if (assistantResponse?.data?.type === 'link') {
        handleCommand(assistantResponse?.data?.value);
      }
    }
  }, [assistantResponse]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech Recognition is not supported in this browser. Please use Chrome.');
      setSpeechError('Speech recognition not supported.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Restart recognition if not speaking
      if (!isSpeaking) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setSpeechError(`Recognition error: ${event.error}`);
      // Attempt to restart recognition
      setTimeout(() => {
        if (recognitionRef.current && !isSpeaking) {
          recognitionRef.current.start();
        }
      }, 1000);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log('Recognized speech:', transcript);
      
      if (transcript.toLowerCase().includes(userData?.aiassistanceName?.toLowerCase() || 'assistant')) {
        processUserCommand(transcript);
      }
    };

    // Start listening initially
    recognitionRef.current.start();
  };

  const processUserCommand = (command) => {
    setSpeechError(null);
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('logout')) {
      speak('Logging you out.', 'en-US').then(handleLogout);
      return;
    }

    if (lowerCommand.includes('customize') || lowerCommand.includes('customise')) {
      speak('Opening customization page.', 'en-US').then(handleCustomize);
      return;
    }

    // Detect language from command (simple implementation)
    const detectedLanguage = detectLanguage(command) || 'en-US';
    handleCommandSubmit(command, detectedLanguage);
  };

  const detectLanguage = (text) => {
    // This is a simple implementation - you might want to use a proper language detection library
    if (/[а-яА-Я]/.test(text)) return 'ru-RU'; // Russian
    if (/[こんにちは]/.test(text)) return 'ja-JP'; // Japanese
    if (/[你好]/.test(text)) return 'zh-CN'; // Chinese
    if (/[안녕하세요]/.test(text)) return 'ko-KR'; // Korean
    // Add more language detection as needed
    return 'en-US'; // Default to English
  };

  const speak = (text, language = 'en-US') => {
    return new Promise((resolve) => {
      if (!text) {
        console.warn('No text provided to speak');
        resolve();
        return;
      }

      // Stop recognition while speaking
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsSpeaking(true);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      utterance.onend = () => {
        setIsSpeaking(false);
        // Restart recognition after speaking is done
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setSpeechError(`Speech error: ${event.error}`);
        setIsSpeaking(false);
        // Restart recognition after error
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start();
        }
        resolve();
      };

      // Wait for voices to be loaded
      const voicesReady = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          let selectedVoice = voices.find(voice => voice.lang === language);
          
          if (!selectedVoice) {
            const langCode = language.split('-')[0];
            selectedVoice = voices.find(voice => voice.lang.includes(langCode));
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(voicesReady, 100);
        }
      };

      voicesReady();
    });
  };

  const handleCommand = (url) => {
    window.open(url, '_blank');
  };

  const handleCommandSubmit = async (command, language = 'en-US') => {
    if (!command || !command.trim()) {
      speak('I didn\'t hear a command. Please try again.', language);
      return;
    }

    try {
      await dispatch(askAssistant(command)).unwrap();
    } catch (error) {
      console.error('Error asking assistant:', error);
      speak('I encountered an error while processing your request. Please try again.', language);
    }
  };

  const handleLogout = () => {
    console.log("logout")
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

  // UI rendering remains the same as your original code
  const username = userData?.name || 'User';
  const assistantName = userData?.aiassistanceName || 'Your Assistant';
  const assistantImage = userData?.assistanceImage || 'https://via.placeholder.com/150';

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

      {assistantResponse && (
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