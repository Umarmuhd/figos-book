import { defineStore } from 'pinia';
import {
  checkHasAuthToken,
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from 'src/data/token.utils';
import { ref } from 'vue';

export const useAuth = defineStore('auth-store', () => {
  const isAuthenticated = ref(false);

  const init = async () => {
    const isAuth = await checkHasAuthToken();
    isAuthenticated.value = isAuth;
  };

  const authorize = (access_token: string, refresh_token = '') => {
    setAuthToken(access_token, refresh_token);
    isAuthenticated.value = true;
  };

  const unauthorize = () => {
    isAuthenticated.value = false;
    removeAuthToken();
  };

  const setToken = (token: string) => {
    setAuthToken(token);
  };

  const getToken = () => {
    return getAuthToken();
  };

  return {
    init,
    isAuthenticated,
    authorize,
    unauthorize,
    setToken,
    getToken,
  };
});
