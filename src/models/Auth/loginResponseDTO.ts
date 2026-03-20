export interface LoginResponseDTO {
  id: number;
  username: string;
  fullname: string;
  email: string;
  rol: string;
  isActive: boolean;
  accessToken: string;
  refreshToken: string;
}