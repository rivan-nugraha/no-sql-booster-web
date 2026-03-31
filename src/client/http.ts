import ky, { HTTPError } from 'ky';
import { store } from '../redux/redux-store';
import { logout, setTokens } from '../redux/auth';
import { computeSignature } from './signature';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  skipRefresh?: boolean;
};

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(
    /\/$/,
    '',
  );
const API_KEY = import.meta.env.VITE_API_KEY || '';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || '';

async function buildHeaders(accessToken: string | undefined, extra?: Record<string, string>) {
  const timestamp = new Date().toISOString();
  const signature = await computeSignature(
    API_KEY,
    SECRET_KEY,
    accessToken || '',
    timestamp,
  );
  return {
    'Content-Type': 'application/json',
    signature,
    timestamp,
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    ...extra,
  };
}

async function tryRefreshToken() {
  const state = store.getState().auth;
  if (!state.refresh_token || !state.user_id) {
    throw new Error('No refresh token');
  }
  const headers = await buildHeaders(state.access_token);
  const response = await ky
    .post(`${BASE_URL}/auth/refresh`, {
      json: { user_id: state.user_id, refresh_token: state.refresh_token },
      headers,
    })
    .json<{ data: { access_token: string; refresh_token: string } }>();

  store.dispatch(
    setTokens({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    }),
  );

  return response.data.access_token;
}

export async function httpRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { skipRefresh, token, method = 'GET', body, headers } = options;
  const accessToken = token || store.getState().auth.access_token;
  const signedHeaders = await buildHeaders(accessToken, headers);

  try {
    return await ky(path.replace(/^\//, ''), {
      prefixUrl: BASE_URL,
      method,
      headers: signedHeaders,
      json: body,
    }).json<TResponse>();
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === 401 && !skipRefresh) {
      try {
        const newToken = await tryRefreshToken();
        const retryHeaders = await buildHeaders(newToken, headers);
        return await ky(path.replace(/^\//, ''), {
          prefixUrl: BASE_URL,
          method,
          headers: retryHeaders,
          json: body,
        }).json<TResponse>();
      } catch (refreshErr) {
        store.dispatch(logout());
        throw refreshErr;
      }
    }
    throw err;
  }
}
