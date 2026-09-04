import { environment } from '../config/env';

export const standardUser = {
  username: environment.sauceUsername,
  password: environment.saucePassword,
};
