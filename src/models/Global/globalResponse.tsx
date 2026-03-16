export interface GlobalResponse<T> {
    ok: boolean;
    message: string;
    data: T;
    timestamp?: string;
    details?: string | null;
}