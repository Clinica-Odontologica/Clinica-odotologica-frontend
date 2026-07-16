import axios from "axios";
import type { LoginRequestDTO } from "../models/Auth/loginRequestDTO";
import type { LoginResponseDTO } from "../models/Auth/loginResponseDTO";
import type { RegisterRequestDTO } from "../models/Auth/registerRequestDTO";
import type { RegisterResponseDTO } from "../models/Auth/registerResponseDTO";
import type { GlobalResponse } from "../models/Global/globalResponse";

const API_URL = `${import.meta.env.VITE_URL_API}/auth`;

export async function login(
  body: LoginRequestDTO,
): Promise<LoginResponseDTO> {
  const url = `${API_URL}/login`;

  const res = await axios.post<GlobalResponse<LoginResponseDTO>>(
    url,
    body,
  );

  return res.data.data;
}

export async function register(
  body: RegisterRequestDTO,
): Promise<RegisterResponseDTO> {
  const url = `${API_URL}/register`;

  const res = await axios.post<GlobalResponse<RegisterResponseDTO>>(
    url,
    body,
  );

  return res.data.data;
}
