export interface PatientDTO {
  id: number;
  dni: string;
  name: string;
  last_name: string;
  phone?: string;
  email?: string;
}