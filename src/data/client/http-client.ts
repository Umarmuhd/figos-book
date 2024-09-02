import axios from 'axios';
import { ConfigValue } from 'src/config';
import { getAuthToken, removeAuthToken, setAuthToken } from '../token.utils';
import { AuthResponse } from 'src/types/auth';

// TODO: Due to windows timeout was set to 15000
export const Axios = axios.create({
  baseURL: ConfigValue.API_URL,
  timeout: 150000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
Axios.interceptors.request.use(
  async (config) => {
    const tokens = await getAuthToken();
    // //@ts-ignore
    // config.headers = {
    //   ...config.headers,
    //   Authorization: `Bearer ${token ? token : ''}`,
    // };
    config.headers['Authorization'] = `Bearer ${
      tokens.access_token ? tokens.access_token : ''
    }`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      (error.response && error.response.status === 403) ||
      (error.response && error.response.data.message === 'ERROR.NOT_AUTHORIZED')
    ) {
      removeAuthToken();
      //   Router.reload();
    }
    if (error.response && error.response.status === 401) {
      const tokens = getAuthToken();
      await refreshToken(tokens.refresh_token ?? '')
        .catch(() => removeAuthToken())
        .then((tokens) => {
          if (!tokens) throw new Error('unable to refresh token');
          console.log({ tokens });

          setAuthToken(tokens.accessToken, tokens.refreshToken);
        });
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

async function refreshToken(token: string): Promise<AuthResponse['tokens']> {
  const res = await fetch(ConfigValue.API_URL + '/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Refresh ${token}`,
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  return await res.json();
}
