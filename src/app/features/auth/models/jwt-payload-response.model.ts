export interface JwtPayload {
  sub: string; // email
  jti: string;
  iat: number;
  user_id: string;
  email: string;
  name: string;
  role: string;
  store_name: string;
  exp: number;
  iss: string;
  aud: string;
}
