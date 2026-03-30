export interface RegisterResponseDTO {
  id: number;
  username: string;
  fullName: string;
  email: string;
  rol: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accessToken: string;
  refreshToken: string;
}
