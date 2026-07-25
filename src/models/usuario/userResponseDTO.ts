export interface UserResponseDTO {
  id: number;
  username: string;
  fullname: string;
  email: string;
  rol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequestDTO {
  username: string;
  password?: string;
  fullname: string;
  email: string;
  rol: string;
  isActive: boolean;
}