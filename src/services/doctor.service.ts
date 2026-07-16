import { api } from "../utils/axiosInterceptor"; 
import type { DoctorDTO } from "../models/doctor/doctorDTO";
import type { DoctorRequestDTO } from "../models/doctor/doctorRequestDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/doctores";

export const doctorService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<DoctorDTO>>> => {
    const response = await api.get<GlobalResponse<Page<DoctorDTO>>>(
      `${ENDPOINT}/dashboard-paginated`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getActiveList: async (): Promise<GlobalResponse<DoctorDTO[]>> => {
    const response = await api.get<GlobalResponse<DoctorDTO[]>>(
      `${ENDPOINT}/active-list`,
    );
    return response.data;
  },

  getById: async (id: number): Promise<GlobalResponse<DoctorDTO>> => {
    const response = await api.get<GlobalResponse<DoctorDTO>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },

  save: async (
    doctor: DoctorRequestDTO,
  ): Promise<GlobalResponse<DoctorDTO>> => {
    const response = await api.post<GlobalResponse<DoctorDTO>>(
      `${ENDPOINT}/save`,
      doctor,
    );
    return response.data;
  },

  update: async (
    id: number,
    doctor: DoctorRequestDTO,
  ): Promise<GlobalResponse<DoctorDTO>> => {
    const response = await api.put<GlobalResponse<DoctorDTO>>(
      `${ENDPOINT}/update/${id}`,
      doctor,
    );
    return response.data;
  },

  delete: async (id: number): Promise<GlobalResponse<void>> => {
    const response = await api.delete<GlobalResponse<void>>(
      `${ENDPOINT}/delete/${id}`,
    );
    return response.data;
  },
};