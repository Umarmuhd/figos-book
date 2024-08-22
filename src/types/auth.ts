export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {};
}
