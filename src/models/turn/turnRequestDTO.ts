export interface TurnRequestDTO {
  doctor_id: number;
  patient_id: number;
  treatment_ids: number[];
  date: string; // ISO 8601
  time: string; // HH:mm
}
