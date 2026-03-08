import { apiUri } from './api-config';

export function encodeArrayForSpring(array: unknown[]): string {
  // Just join them: [1, 2] becomes "1,2"
  return encodeURIComponent(array.join(','));
}

export const serverDownCode = 599;

export function sendApi(
  path: string,
  init: RequestInit = {},
  refresh: boolean = true,
  contentType: string = 'application/json'
): Promise<Response> {
  function helper(contentType: string): Promise<Response> {
    let token = localStorage.getItem('accessToken');
    var auth: HeadersInit = {};

    if (contentType == 'multipart/form-data') {
      auth = token ? { Authorization: `Bearer ${token}` } : {};
    } else {
      auth = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': contentType }
        : { 'Content-Type': contentType };
    }

    init['headers'] = auth;
    const promise = fetch(apiUri + path, init).catch((error) => {
      console.error('Error:', error);
      console.log('server is down!!');
      return Promise.resolve(
        new Response({} as BodyInit, { status: serverDownCode })
      );
    });
    return promise;
  }

  if (refresh === true) {
    return authRenewToken().then(() => {
      return helper(contentType);
    });
  }

  return helper(contentType);
}

export const authRenewToken = async (
  contentType: string = 'application/json'
): Promise<void> => {
  console.log('Token is renewed.');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;

  const res = await fetch(apiUri + '/api/auth/refreshtoken', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: JSON.stringify({ refreshToken }),
  });
  try {
    const token = await res.json();
    if (res.status === 200) {
      localStorage.setItem('accessToken', token['accessToken']);
    }
  } catch (e) {
    // non-JSON response (e.g. 4xx) — do nothing
  }
};
