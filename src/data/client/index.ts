import { AuthResponse, LoginUserInput } from 'src/types/auth';
import { API_ENDPOINTS } from './endpoints';
import { HttpClient } from './http-client';
import { User } from 'src/types/user';
import { Account, Business, CreateBusinessPayload } from 'src/types/business';

class Client {
  users = {
    login: (input: LoginUserInput) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.USERS_LOGIN, input),
    me: () => {
      return HttpClient.get<User>(API_ENDPOINTS.USERS_ME, {
        with: 'permissions',
      });
    },
  };
  business = {
    me: () => {
      return HttpClient.get<Business[]>(API_ENDPOINTS.BUSINESSES_ME);
    },
    create: (input: CreateBusinessPayload) => {
      return HttpClient.post<{}>(API_ENDPOINTS.BUSINESSES, input);
    },
    accounts: (businessId: string) => {
      return HttpClient.get<Account[]>(
        API_ENDPOINTS.BUSINESS_ACCOUNTS + businessId
      );
    },
  };
}

export default new Client();
