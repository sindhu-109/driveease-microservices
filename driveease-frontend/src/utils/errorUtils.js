/**
 * errorUtils.js
 *
 * Backend error responses use Spring Boot's default error format:
 *   {
 *     timestamp: "...",
 *     status:    500,
 *     error:     "Internal Server Error",
 *     message:   "Vehicle is currently not available",
 *     path:      "/ms3/bookings"
 *   }
 *
 * Spring @Valid failures return:
 *   {
 *     status: 400,
 *     error:  "Bad Request",
 *     message: "Validation failed for ..."
 *   }
 *   or a map of field errors depending on the global exception handler.
 *
 * GlobalExceptionHandler in each service re-throws RuntimeException
 * which Spring maps to a 500 with the exception message in "message".
 */

/**
 * Extract a user-readable message from an Axios error.
 */
export const extractError = (error) => {
  // Spring Boot error body — "message" field
  const msg = error?.response?.data?.message;
  if (msg) return msg;

  // Spring validation errors may put details in "errors" array
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => e.defaultMessage || e.message).join('. ');
  }

  // Plain string body
  if (typeof error?.response?.data === 'string' && error.response.data) {
    return error.response.data;
  }

  // HTTP status messages
  const status = error?.response?.status;
  if (status === 400) return 'Invalid request. Please check the form.';
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 403) return 'You do not have permission to do this.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'A conflict occurred. The resource may already exist.';

  // Network / connection error
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED') {
    return 'Cannot reach the server. Make sure all backend services are running.';
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
};
