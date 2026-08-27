export interface TurnRequestDTO {
  doctorId: number;
  patientId: number;
  serviceIds: number[];
  appointmentDate: string;
}
