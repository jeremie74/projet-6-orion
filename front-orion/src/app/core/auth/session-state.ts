import { getAccessToken, getStoredUser } from './token-storage';

export type SessionState = {
  isAuthenticated: boolean;
  username: string | null;
};

export const readSession = (): SessionState => {
  const token = getAccessToken();
  const user = getStoredUser();

  if (token && user && user.username?.trim().length > 0) {
    return { isAuthenticated: true, username: user.username };
  }

  return { isAuthenticated: false, username: null };
};
