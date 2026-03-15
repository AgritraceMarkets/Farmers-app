import React from 'react';
import authService from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return null; // App component handles showing auth screen
  }

  return children;
};

export default ProtectedRoute;