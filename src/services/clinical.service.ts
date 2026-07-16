import axios from "axios";
import type { ClinicalEntryRequestDTO } from "../models/clinical/clinicalEntryRequestDTO";
import type { ClinicalEntryResponseDTO } from "../models/clinical/clinicalEntryResponseDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const API_URL = `${import.meta.env.VITE_URL_API}/clinica`;

export const clinicalService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<ClinicalEntryResponseDTO>>> => {
    const response = await axios.get<
      GlobalResponse<Page<ClinicalEntryResponseDTO>>
    >(`${API_URL}/dashboard-paginated`, {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (
    id: number,
  ): Promise<GlobalResponse<ClinicalEntryResponseDTO>> => {
    const response = await axios.get<GlobalResponse<ClinicalEntryResponseDTO>>(
      `${API_URL}/${id}`,
    );
    return response.data;
  },

  save: async (
    entry: ClinicalEntryRequestDTO,
  ): Promise<GlobalResponse<void>> => {
    const response = await axios.post<GlobalResponse<void>>(
      `${API_URL}/save`,
      entry,
    );
    return response.data;
  },
};
