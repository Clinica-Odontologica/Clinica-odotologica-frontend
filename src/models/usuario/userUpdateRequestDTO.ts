export interface UserUpdateRequestDTO {
    username: string;
    password?: string;
    fullname: string;
    email: string;
    rol: string;
    isActive: boolean;
}
