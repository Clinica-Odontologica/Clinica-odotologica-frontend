export interface LoginRequestDTO {
    username: string;
    password: string;
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