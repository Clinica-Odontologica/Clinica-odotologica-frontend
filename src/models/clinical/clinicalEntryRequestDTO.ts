export interface ClinicalEntryRequestDTO {
  turnId: number;
  diagnosis: string;
  treatmentNotes: string;
  attachmentUrl?: string;
}