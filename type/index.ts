export interface Shift {
  shift_ID: number;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  person_ID?: number;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  email?: string;
}

export interface ClockEntry {
  id: number;
  person_ID: number;
  clock_in: string;  // ISO timestamp
  clock_out?: string; // ISO timestamp
  date: string;      // YYYY-MM-DD
  duration_minutes?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ClockStatus = 'clocked_in' | 'clocked_out';

export interface StatusResponse {
  status: ClockStatus;
  clock_in_time?: string;
  person_ID?: number;
}

