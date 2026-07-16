export interface DoctorDTO {
  id: number;
  name: string;
  lastName: string;
  last_name?: string;
  specialty: string;
  isActive?: boolean;
}
