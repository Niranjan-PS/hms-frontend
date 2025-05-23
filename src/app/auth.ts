export interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  token: string;
}