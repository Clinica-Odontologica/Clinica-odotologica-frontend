import { api } from "../utils/axiosInterceptor"; 
import type { ClinicalEntryRequestDTO } from "../models/clinical/clinicalEntryRequestDTO";
import type { ClinicalEntryResponseDTO } from "../models/clinical/clinicalEntryResponseDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/clinica";

export const clinicalService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<ClinicalEntryResponseDTO>>> => {
    const response = await api.get<GlobalResponse<Page<ClinicalEntryResponseDTO>>>(
      `${ENDPOINT}/dashboard-paginated`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getById: async (
    id: number,
  ): Promise<GlobalResponse<ClinicalEntryResponseDTO>> => {
    const response = await api.get<GlobalResponse<ClinicalEntryResponseDTO>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },

  save: async (
    entry: ClinicalEntryRequestDTO,
  ): Promise<GlobalResponse<void>> => {
    const response = await api.post<GlobalResponse<void>>(
      `${ENDPOINT}/save`,
      entry,
    );
    return response.data;
  },
};
