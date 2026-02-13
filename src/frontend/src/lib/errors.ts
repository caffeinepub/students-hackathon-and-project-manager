export function normalizeError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Gemini-specific errors
    if (message.includes('gemini api key not configured') || message.includes('invalid gemini api key configuration')) {
      return 'The AI service is not configured properly. Please contact the administrator to set up the Gemini API key.';
    }
    if (message.includes('invalid gemini api key') || message.includes('api key not valid')) {
      return 'The AI service API key is invalid. Please contact the administrator.';
    }
    if (message.includes('gemini rate limit') || message.includes('rate limit')) {
      return 'The AI service is currently rate-limited. Please try again in a few moments.';
    }
    if (message.includes('gemini request timeout') || message.includes('request timeout')) {
      return 'The AI service request timed out. Please try again.';
    }
    if (message.includes('gemini network error')) {
      return 'Unable to reach the AI service. Please check your connection and try again.';
    }
    if (message.includes('gemini returned unexpected response') || message.includes('unexpected response')) {
      return 'The AI service returned an unexpected response. Please try rephrasing your question.';
    }
    if (message.includes('endpoint not found')) {
      return 'The AI service endpoint was not found. Please contact the administrator.';
    }
    if (message.includes('invalid gemini model')) {
      return 'The AI model configuration is invalid. Please contact the administrator.';
    }

    // Map common backend errors to user-friendly messages
    if (message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
    if (message.includes('not found')) {
      return 'The requested item was not found.';
    }
    if (message.includes('already exists')) {
      return 'This item already exists. Please use a different identifier.';
    }
    if (message.includes('student id') && message.includes('match')) {
      return 'Student ID does not match your profile.';
    }
    if (message.includes('duplicate')) {
      return 'A duplicate entry was detected. Please check your input.';
    }
    if (message.includes('invalid')) {
      return 'Invalid input. Please check your data and try again.';
    }
    if (message.includes('actor not available')) {
      return 'Connection to backend is not ready. Please wait a moment and try again.';
    }
    if (message.includes('access control') || message.includes('initialization')) {
      return 'Backend initialization in progress. Please wait a moment and try again.';
    }
    if (message.includes('permission') || message.includes('admin')) {
      return 'You do not have the required permissions for this action.';
    }
    if (message.includes('trap') || message.includes('reject')) {
      return 'The backend encountered an error. Please try again or contact support.';
    }
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
