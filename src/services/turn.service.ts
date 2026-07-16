import { api } from "../utils/axiosInterceptor"; 
import type { TurnRequestDTO } from "../models/turn/turnRequestDTO";
import type { TurnResponseDTO } from "../models/turn/turnResponseDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/tratamientos";

export const turnService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<TurnResponseDTO>>> => {
    const response = await api.get<GlobalResponse<Page<TurnResponseDTO>>>(
      `${ENDPOINT}/dashboard-paginated`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getById: async (id: number): Promise<GlobalResponse<TurnResponseDTO>> => {
    const response = await api.get<GlobalResponse<TurnResponseDTO>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },

  getByDoctorAndDate: async (
    doctorId: number,
    date?: string,
  ): Promise<GlobalResponse<TurnResponseDTO[]>> => {
    const response = await api.get<GlobalResponse<TurnResponseDTO[]>>(
      `${ENDPOINT}/doctor/${doctorId}`,
      {
        params: { date },
      },
    );
    return response.data;
  },

  save: async (
    turn: TurnRequestDTO,
    userId: number,
  ): Promise<GlobalResponse<TurnResponseDTO>> => {
    const response = await api.post<GlobalResponse<TurnResponseDTO>>(
      `${ENDPOINT}/save`,
      turn,
      {
        params: { userId },
      },
    );
    return response.data;
  },

  delete: async (id: number): Promise<GlobalResponse<void>> => {
    const response = await api.delete<GlobalResponse<void>>(`${ENDPOINT}/${id}`, {
      params: { id },
    });
    return response.data;
  },
};
