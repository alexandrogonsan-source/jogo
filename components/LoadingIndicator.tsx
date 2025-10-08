
import React from 'react';

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-teal-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg font-cinzel tracking-wider">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
