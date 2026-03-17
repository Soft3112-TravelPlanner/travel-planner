export interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterType {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginType {
  email: string;
  password: string;
  remember: boolean;
}
