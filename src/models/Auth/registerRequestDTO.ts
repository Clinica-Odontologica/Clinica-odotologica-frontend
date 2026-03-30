export interface RegisterRequestDTO {
  username: string;
  fullname: string;
  email: string;
  passwordd: string;
  role: {
    id: number;
    name: string;
  };
}
