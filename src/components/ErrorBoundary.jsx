import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex-1 flex items-center justify-center p-4 dark:bg-gray-900'>
          <div className='text-center max-w-md'>
            <h1 className='text-4xl mb-4'>😕</h1>
            <h2 className='text-2xl font-bold mb-2 dark:text-white'>Oops! Something went wrong</h2>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className='bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600'
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
