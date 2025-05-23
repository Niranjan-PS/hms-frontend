export interface MedicalHistory {
  condition: string;
  diagnosedAt: string;
  notes?: string;
}

export interface Patient {
  _id?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medicalHistory?: MedicalHistory[];
}