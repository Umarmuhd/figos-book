import axios from 'axios';
import { ConfigValue } from 'src/config';
import { getAuthToken, removeAuthToken } from '../token.utils';

// TODO: Due to windows timeout was set to 15000
const Axios = axios.create({
  baseURL: ConfigValue.API_URL,
  timeout: 150000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
Axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    // config.headers = {
    //   ...config.headers,
    //   Authorization: `Bearer ${token ? token : ''}`,
    // };
    config.headers['Authorization'] = `Bearer ${token ? token : ''}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403) ||
      (error.response && error.response.data.message === 'ERROR.NOT_AUTHORIZED')
    ) {
      removeAuthToken();
      //   Router.reload();
    }
    return Promise.reject(error);
  }
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await Axios.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await Axios.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await Axios.delete<T>(url);
    return response.data;
  }
}
