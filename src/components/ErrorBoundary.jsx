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

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex-1 flex items-center justify-center p-4'>
          <div className='text-center max-w-md'>
            <h1 className='text-4xl mb-4'>😕</h1>
            <h2 className='text-2xl font-bold mb-2 dark:text-white'>Oops! Something went wrong</h2>
            {import.meta.env.DEV && (
              <p className='text-xs text-red-400 font-mono mb-4 text-left bg-black/10 p-2 rounded'>
                {this.state.error?.message}
              </p>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className='bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700'
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
