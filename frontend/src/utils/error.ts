import axios from 'axios';

export function getErrorMessage(err: unknown, defaultMessage = 'An error occurred'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMessage;
}
