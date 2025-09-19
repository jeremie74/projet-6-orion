import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './auth-storage.constants';

export type SessionState = {
  isAuthenticated: boolean;
  username: string | null;
};

export const readSession = (): SessionState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isAuthenticated: false, username: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userRaw) {
    return { isAuthenticated: false, username: null };
  }

  try {
    const user = JSON.parse(userRaw);
    if (
      typeof user === 'object' &&
      user !== null &&
      typeof user.username === 'string' &&
      user.username.trim().length > 0
    ) {
      return { isAuthenticated: true, username: user.username };
    }
  } catch {
    return { isAuthenticated: false, username: null };
  }

  return { isAuthenticated: false, username: null };
};
