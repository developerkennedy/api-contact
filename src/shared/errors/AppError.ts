export class AppError extends Error {
    statusCode: number;

    constructor(value: string, statusCode: number) {
        super(value);
        this.name = 'AppError';
        this.message = value;
        this.statusCode = statusCode;
    }
}
