import { useEffect } from 'react';

export const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-600';

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slideIn px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
      type === 'error' ? 'bg-red-600' : 'bg-green-600'
    }`}>
      {message}
    </div>
  );
};
