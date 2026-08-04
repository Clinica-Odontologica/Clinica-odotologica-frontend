import type { RoleDTO } from "./userResponseDTO";
export interface UserUpdateRequestDTO {
  username: string;
  password?: string;
  fullname: string;
  email: string;
  rol: RoleDTO; 
  isActive: boolean; 
}