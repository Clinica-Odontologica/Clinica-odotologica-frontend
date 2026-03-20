export interface RegisterResponseDTO {
  id: number;
  fullName: string;
  username: string;
  email: string;
  rol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accessToken: string;
  refreshToken: string;
}