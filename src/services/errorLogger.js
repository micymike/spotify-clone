const logError = async (error, context = {}) => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'client_error',
        error: {
          message: error.message,
          stack: error.stack,
          ...context
        }
      })
    });
  } catch (e) {
    // Fallback to console if API call fails
    console.error('Error logging failed:', e);
    console.error('Original error:', error);
    console.error('Context:', context);
  }
};

export default logError;
