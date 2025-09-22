import {
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from './auth-storage.constants';

export type StoredUser = {
  userId: number;
  username: string;
};

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
};

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && !!window.localStorage;

const dispatchStorageEvent = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('storage'));
};

export const persistSession = ({
  accessToken,
  refreshToken,
  userId,
  username,
}: SessionPayload): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({ userId, username })
  );

  dispatchStorageEvent();
};

export const updateStoredTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  dispatchStorageEvent();
};

export const getAccessToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): StoredUser | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.username === 'string' &&
      typeof parsed.userId === 'number'
    ) {
      return parsed as StoredUser;
    }
  } catch {
    return null;
  }

  return null;
};

export const hasActiveSession = (): boolean => {
  const token = getAccessToken();
  const user = getStoredUser();

  return Boolean(
    token &&
    user &&
    typeof user.username === 'string' &&
    user.username.trim().length > 0
  );
};

export const clearSession = (): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);

  dispatchStorageEvent();
};
