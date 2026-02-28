export interface RegisterRequestDTO {
    username: string;
    fullname: string;
    email: string;
    password: string;
    role: {
        id: number;
        name: string;
    }
}
export  interface RegisterResponseDTO {
    id: number;
    username: string;
    fullname: string;
    email: string;
    role: {
        id: number;
        name: string;
    },
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    accessToken: string;
    refreshToken: string;
}