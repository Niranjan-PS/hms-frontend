export interface Appointment {
    
  _id?: string;
  patient: { _id: string; name: string; email: string };
  doctor: { _id: string; user: { name: string }; department: string };
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  createdAt?: string;
  updatedAt?: string;
}

