export interface RoleDTO {
  id: number;
  name: string;
}
export interface UserResponseDTO {
  id: number;
  username: string;
  fullname: string;
  password: string;
  email: string;
  rol: RoleDTO; 
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

