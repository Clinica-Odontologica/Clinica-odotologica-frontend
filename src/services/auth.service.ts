import axios from "axios";
import type { LoginRequestDTO, LoginResponseDTO } from "../models/Auth/loginRequestDTO";
import type { RegisterRequestDTO, RegisterResponseDTO } from "../models/Auth/registerDTO";
import type {GlobalResponse}from "../models/Global/globalResponse";

const Base_URL = import.meta.env.VITE_URL_API + "/auth";

export async function login(
    body: LoginRequestDTO
): Promise<LoginResponseDTO> {

    const url = `${Base_URL}/login`;

    const res = await axios.post<GlobalResponse<LoginResponseDTO>>(url, body);

    return res.data.data;
}

export async function register(
    body: RegisterRequestDTO
): Promise<RegisterResponseDTO> {

    const url = `${Base_URL}/register`;

    const res = await axios.post<GlobalResponse<RegisterResponseDTO>>(url, body);

    return res.data.data;
}
