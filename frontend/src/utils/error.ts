import axios from 'axios';
import { MESSAGES } from '../constants/messages';

export function getErrorMessage(err: unknown, defaultMessage = MESSAGES.GENERIC_ERROR): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return MESSAGES.NETWORK_ERROR;
    }
    const status = err.response.status;
    const message = err.response.data?.message;

    if (status === 401) {
      return message || MESSAGES.UNAUTHORIZED;
    }
    if (status === 403) {
      return message || MESSAGES.FORBIDDEN;
    }
    if (status === 400) {
      return message || MESSAGES.BAD_REQUEST;
    }
    if (status === 404) {
      return message || MESSAGES.NOT_FOUND;
    }
    if (status >= 500) {
      return message || MESSAGES.SERVER_ERROR;
    }
    return message || err.message || defaultMessage;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMessage;
}
