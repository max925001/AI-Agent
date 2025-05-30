import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserData } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn, data } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        await dispatch(getUserData()).unwrap();
        setIsValidated(true);
      } catch (error) {
        // Clear localStorage on validation failure
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('data');
        localStorage.removeItem('role');
        toast.error('Session invalid. Please log in.');
        setIsValidated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [dispatch]);

  // Show loading state while validating
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Check authentication using Redux state
  const isAuthenticated = isLoggedIn && data && Object.keys(data).length > 0 && isValidated;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;