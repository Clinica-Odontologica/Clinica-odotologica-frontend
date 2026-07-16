import { api } from "../utils/axiosInterceptor"; // Asegúrate de que la ruta coincida con tu carpeta
import type { PatientDTO } from "../models/patient/patientDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/pacientes";

export const patientService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<PatientDTO>>> => {
    const response = await api.get<GlobalResponse<Page<PatientDTO>>>(
      `${ENDPOINT}/dashboard-paginated`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getById: async (id: number): Promise<GlobalResponse<PatientDTO>> => {
    const response = await api.get<GlobalResponse<PatientDTO>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },

  getByDni: async (dni: string): Promise<GlobalResponse<PatientDTO>> => {
    const response = await api.get<GlobalResponse<PatientDTO>>(
      `${ENDPOINT}/dni/${dni}`,
    );
    return response.data;
  },

  save: async (patient: PatientDTO): Promise<GlobalResponse<PatientDTO>> => {
    const response = await api.post<GlobalResponse<PatientDTO>>(
      `${ENDPOINT}/save`,
      patient,
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
