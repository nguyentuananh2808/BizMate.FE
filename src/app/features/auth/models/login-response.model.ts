export interface LoginResponse {
  AccessToken: {
    Token: string;
    ExpiresIn: number;
  };
  User: {
    FullName: string;
    Email: string;
    Role: string;
    StoreId: string;
    UserId: string;
  };
}
