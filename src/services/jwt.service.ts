export function getToken(): string {
  return window.localStorage['jwtToken'];
}

export function saveToken(token: string): void {
  window.localStorage['jwtToken'] = token;
}

export function destroyToken(): void {
  window.localStorage.removeItem('jwtToken');
}
