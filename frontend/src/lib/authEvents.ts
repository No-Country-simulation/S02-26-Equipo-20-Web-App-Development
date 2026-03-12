export const authEvents = new EventTarget();
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function dispatchUnauthorized() {
  authEvents.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}
