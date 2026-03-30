export interface LoginResponseDTO {
  id: number;
  username: string;
  fullname: string;
  email: string;
  rol: {
    id: number;
    name: string;
  };
  isActive: boolean;
  accessToken: string;
  refreshToken: string;
}
