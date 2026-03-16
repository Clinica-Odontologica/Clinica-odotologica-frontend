export interface LoginRequestDTO {
    email: string;
    passwordd: string;
}
export interface LoginResponseDTO {
    id: number;
    username: string;
    fullname: string;
    email: string;
    rol: {
        id: number;
        name: string;
    },
    accessToken: string;
    refreshToken: string;
    active: boolean;
}