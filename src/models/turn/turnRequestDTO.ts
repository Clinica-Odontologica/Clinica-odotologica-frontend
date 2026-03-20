export interface TurnRequestDTO {
  patientId: number;
  doctorId: number;
  serviceIds: number[];
  appointmentDate: string;
}