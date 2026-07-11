export interface AuthTokenPayload {
  sub: string;
  sid: string;
  type: 'access' | 'refresh';
}
