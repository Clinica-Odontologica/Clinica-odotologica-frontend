import { api } from "../utils/axiosInterceptor";
import type { ServiceDTO } from "../models/service/serviceDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/tratamientos";

export const treatmentService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<ServiceDTO>>> => {
    const response = await api.get<GlobalResponse<Page<ServiceDTO>>>(
      `${ENDPOINT}/dashboard-paginated`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getActiveList: async (): Promise<GlobalResponse<ServiceDTO[]>> => {
    const response = await api.get<GlobalResponse<ServiceDTO[]>>(
      `${ENDPOINT}/active-list`,
    );
    return response.data;
  },

  save: async (service: ServiceDTO): Promise<GlobalResponse<ServiceDTO>> => {
    const response = await api.post<GlobalResponse<ServiceDTO>>(
      `${ENDPOINT}/save`,
      service,
    );
    return response.data;
  },

  update: async (
    id: number,
    service: ServiceDTO,
  ): Promise<GlobalResponse<ServiceDTO>> => {
    const response = await api.put<GlobalResponse<ServiceDTO>>(
      `${ENDPOINT}/${id}`,
      service,
    );
    return response.data;
  },

  delete: async (id: number): Promise<GlobalResponse<void>> => {
    const response = await api.delete<GlobalResponse<void>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },
};
