export interface AdminLogin {
  _id?: string;
  name?: string;
  email: string;
  password?: string;
  token?: string;
  isAdmin?: boolean;
}
