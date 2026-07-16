import { DoctorDTO } from "../doctor/doctorDTO";
import { PatientDTO } from "../patient/patientDTO";
import { ServiceDTO } from "../service/serviceDTO";

export interface TurnResponseDTO {
  id: number;
  doctor: DoctorDTO;
  patient: PatientDTO;
  treatments: ServiceDTO[];
  date: string;
  time: string;
  totalCost: number;
  status: string;
  createdAt: string;
}
