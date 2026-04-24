export type Role = 'doctor' | 'patient';

export interface Patient {
  id: string; // P001, etc.
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  clinicName: string;
  location: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  date: string;
  time: string;
  type: 'Regular' | 'Emergency' | 'Follow-up';
  status: 'Pending' | 'Completed' | 'Cancelled';
  reminderMinutes?: number; // Minutes before appointment to remind
  isReminderSent?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  potency: string; // e.g., 30C, 200C
  stock: number;
  unit: string; // e.g., Drops, Pills, ml
  price: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  date: string;
  complaints: string;
  diagnosis: string;
  medicines: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    duration: string;
  }[];
  notes?: string;
  amount: number;
  isPaid: boolean;
}

export interface BillingRecord {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  items: string[];
  status: 'Paid' | 'Unpaid';
}

export interface CallSession {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  status: 'waiting' | 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
  duration?: number; // in seconds
  notes?: string;
}

export interface CaseRecord {
  id: string;
  patientId: string;
  date: string;
  mentalGenerals: string;
  physicalGenerals: string;
  chiefComplaints: string;
  modalities: string;
  pastHistory: string;
  familyHistory: string;
  miasmaticAnalysis: string;
  repertorization?: string;
}
