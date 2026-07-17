import { api } from "../utils/axiosInterceptor"; 
import type { UserResponseDTO } from "../models/usuario/userResponseDTO";
import type { UserRequestDTO } from "../models/usuario/userRequestDTO";
import type { UserUpdateRequestDTO } from "../models/usuario/userUpdateRequestDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";
import type { Page } from "../models/Global/page";

const ENDPOINT = "/usuarios";

export const userService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
  ): Promise<GlobalResponse<Page<UserResponseDTO>>> => {
    const response = await api.get<GlobalResponse<Page<UserResponseDTO>>>(
      `${ENDPOINT}`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  getById: async (id: number): Promise<GlobalResponse<UserResponseDTO>> => {
    const response = await api.get<GlobalResponse<UserResponseDTO>>(
      `${ENDPOINT}/${id}`,
    );
    return response.data;
  },

  save: async (
    user: UserRequestDTO,
  ): Promise<GlobalResponse<UserResponseDTO>> => {
    const response = await api.post<GlobalResponse<UserResponseDTO>>(
      `${ENDPOINT}/save`,
      user,
    );
    return response.data;
  },

  update: async (
    id: number,
    user: UserUpdateRequestDTO,
  ): Promise<GlobalResponse<UserResponseDTO>> => {
    const response = await api.put<GlobalResponse<UserResponseDTO>>(
      `${ENDPOINT}/update/${id}`,
      user,
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
