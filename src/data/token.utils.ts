import { ConfigValue } from '../config';
// import Cookies from 'js-cookie';
// import SSRCookie from 'cookie';

export const AUTH_TOKEN_KEY = ConfigValue.AUTH_TOKEN_KEY;

// *** Electron Cookies ***
// export const getAuthToken = async () => {
//   if (typeof window === undefined) {
//     return null;
//   }

//   const token = await ipc.getCookie(AUTH_TOKEN_KEY);

//   return token.data.length > 0 ? token.data[0].value : null;
// };

// export async function setAuthToken(token: string) {
//   await ipc.setCookie({
//     name: AUTH_TOKEN_KEY,
//     value: token,
//     expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
//   });
// }

// export async function removeAuthToken() {
//   await ipc.removeCookie(AUTH_TOKEN_KEY);
// }

// export async function checkHasAuthToken() {
//   const token = await getAuthToken();
//   if (!token) return false;
//   return true;
// }

// *** Web Cookies ***
// export const getAuthToken = () => {
//   if (typeof window === undefined) {
//     return null;
//   }

//   return Cookies.get(AUTH_TOKEN_KEY);
// };

// export function setAuthToken(token: string) {
//   Cookies.set(AUTH_TOKEN_KEY, token, { expires: 1 });
// }

// export function removeAuthToken() {
//   Cookies.remove(AUTH_TOKEN_KEY);
// }

// export function checkHasAuthToken() {
//   const token = Cookies.get(AUTH_TOKEN_KEY);
//   if (!token) return false;
//   return true;
// }

// *** Local Storage ***
export const getAuthToken = (): {
  access_token: string | null;
  refresh_token: string | null;
} => {
  if (typeof window === undefined) {
    return { access_token: null, refresh_token: null };
  }

  const result = localStorage.getItem(AUTH_TOKEN_KEY);

  if (result) {
    return JSON.parse(result);
  }

  return { access_token: null, refresh_token: null };
};

export function setAuthToken(access_token: string, refresh_token = '') {
  localStorage.setItem(
    AUTH_TOKEN_KEY,
    JSON.stringify({ access_token, refresh_token })
  );
}

export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function checkHasAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;
  return true;
}
