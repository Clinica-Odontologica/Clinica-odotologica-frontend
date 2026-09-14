import type { ServiceDTO } from "../service/serviceDTO";

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
  services: ServiceDTO[];
  totalCost: number;
}