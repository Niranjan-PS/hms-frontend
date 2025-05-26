export interface Appointment {
  _id: string;
  patient: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: string;
    medicalHistory: any[];
  };
  doctor: {
    _id: string;
    name: string;
    department: string;
    user?: {
      _id: string;
      name?: string;
    };
    email?: string;
    phone?: string;
  };
  date: string;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}