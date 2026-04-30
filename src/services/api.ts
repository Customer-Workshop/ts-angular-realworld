import axios from 'axios';
import { getToken } from './jwt.service';

const api = axios.create({
  baseURL: 'https://api.realworld.show/api',
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

let purgeAuthCallback: (() => void) | null = null;

export function setPurgeAuthCallback(cb: () => void): void {
  purgeAuthCallback = cb;
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';

      if (status === 401 && !url.endsWith('/user')) {
        purgeAuthCallback?.();
      }

      const body =
        error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data
          ? error.response.data
          : { errors: { network: ['Unable to connect. Please check your internet connection.'] } };

      return Promise.reject({ ...body, status });
    }

    return Promise.reject({
      errors: { network: ['Unable to connect. Please check your internet connection.'] },
      status: 0,
    });
  },
);

export default api;
