export type UserRole = 'patient' | 'provider' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    lastLogin?: Date;
    creationTime?: Date;
  };
  patientProfile?: PatientProfile;
  providerProfile?: ProviderProfile;
}

export interface PatientProfile {
  dob?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    verified: boolean;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

export interface ProviderProfile {
  specialty: string;
  licenseNumber: string;
  npiNumber: string;
  bio?: string;
  rating?: number;
  availability?: {
    [day: string]: string[]; // "monday": ["09:00-10:00", "10:00-11:00"]
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  type: 'video' | 'audio' | 'chat';
  scheduledAt: Date;
  durationMinutes: number;
  reasonForVisit: string;
  meetingLink?: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  type: 'soap_note' | 'lab_result' | 'prescription' | 'intake_form' | 'referral';
  data: {
    soapNote?: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    prescription?: {
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      pharmacyId: string;
    };
    [key: string]: any;
  };
  attachments?: {
    url: string;
    name: string;
    mimeType: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    readBy: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachment?: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    thumbnail?: string; // For images
  };
  timestamp: Date;
  readBy: string[];
  edited?: boolean;
  editedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'appointment' | 'prescription' | 'lab_result' | 'system';
  title: string;
  message: string;
  data?: {
    appointmentId?: string;
    chatId?: string;
    recordId?: string;
    [key: string]: any;
  };
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  email: {
    appointments: boolean;
    messages: boolean;
    prescriptions: boolean;
    labResults: boolean;
    marketing: boolean;
  };
  push: {
    appointments: boolean;
    messages: boolean;
    prescriptions: boolean;
    labResults: boolean;
  };
  sms: {
    appointments: boolean;
    reminders: boolean;
  };
}

export interface FCMToken {
  token: string;
  device: string;
  createdAt: Date;
  lastUsed: Date;
}
