import React from 'react';
import { motion } from 'framer-motion';

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
    
    // Log connection errors specifically
    if (error.message.includes('connection') || error.message.includes('end does not exist')) {
      console.error('Connection error detected');
    }
  }

  render() {
    if (this.state.hasError) {
      const isConnectionError = this.state.error.message.includes('connection') || 
                              this.state.error.message.includes('end does not exist');
      
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4"
        >
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">
              {isConnectionError ? 'Connection Error' : 'Oops! Something went wrong'}
            </h1>
            <p className="text-gray-400 mb-6">
              {isConnectionError 
                ? 'Could not connect to the server. Please check your network and try again.'
                : 'We\'re sorry for the inconvenience. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-500 text-black rounded-full hover:bg-green-400 transition"
            >
              Refresh Page
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;