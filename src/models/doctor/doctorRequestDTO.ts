export interface DoctorRequestDTO {
  name: string;
  lastName: string;
  specialty: string;
  username?: string;
  password?: string;
  email?: string;
  isActive?: boolean;
}