export interface PatientRequestDTO {
  dni: string;
  name: string;
  last_name: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}