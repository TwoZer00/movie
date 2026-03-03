import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
          <div className='bg-white rounded-lg p-8 max-w-md text-center shadow-lg'>
            <h1 className='text-3xl font-bold text-red-600 mb-4'>Oops!</h1>
            <p className='text-lg mb-6'>Something went wrong. Please refresh the page.</p>
            <button 
              onClick={() => window.location.href = '/'} 
              className='bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors'
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
