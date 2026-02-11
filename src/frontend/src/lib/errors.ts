export function normalizeError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

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
