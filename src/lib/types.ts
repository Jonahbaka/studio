
export type UserRole = 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'staff' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Patient extends User {
  role: 'patient';
  mrn: string;
  dob: string;
  phone: string;
  insuranceProvider?: string;
  insuranceId?: string;
  allergies: string[];
  conditions: string[];
}

export interface Provider extends User {
  role: 'doctor' | 'nurse';
  npi: string;
  licenseNumber: string;
  specialty: string;
  licenseApproved: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Waiting';
  reason: string;
  notes?: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Prescription {
    id: string;
    patientId: string;
    providerId: string;
    medication: string;
    dosage: string;
    frequency: string;
    status: 'Pending' | 'Sent to Pharmacy' | 'Filled' | 'Cancelled';
    pharmacy: string;
    date: string;
}
