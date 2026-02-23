export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'WAREHOUSE' | 'SUPER_ADMIN';
  createdAt: string;
}
