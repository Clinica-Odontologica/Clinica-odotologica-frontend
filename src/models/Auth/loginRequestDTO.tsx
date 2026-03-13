export interface LoginRequestDTO {
    email: string;
    passwordd: string;
}
export interface LoginResponseDTO {
    id: number;
    username: string;
    fullname: string;
    email: string;
    role: {
        id: number;
        name: string;
    },
    accessToken: string;
    refreshToken: string;
    active: boolean;
}