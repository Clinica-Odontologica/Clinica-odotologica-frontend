export interface TurnResponseDTO {
  id: number;
  patientId: number;
  patientName: string;
  patientDni: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  status: string;
  appointmentDate: string;
  services: {
    id: number;
    name: string;
    basePrice: number;
  }[];
  totalCost: number;
}