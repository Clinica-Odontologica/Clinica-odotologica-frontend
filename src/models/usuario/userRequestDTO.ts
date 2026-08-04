import type { RoleDTO } from "./userResponseDTO";

export interface UserRequestDTO {
  username: string;
  password?: string;
  fullname: string;
  email: string;
  rol: RoleDTO; // 👈 Ahora es un objeto
  isActive: boolean;
}