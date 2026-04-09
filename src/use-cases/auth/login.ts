import { IUserRepository } from "../../repositories/user/interfaces/IUserRepository";
import { AppError } from "../../shared/errors/AppError";
import { comparePassword } from "../../shared/utils/hash";
import { signToken } from "../../auth/jwt";

export class Login {
    constructor(private readonly repository: IUserRepository) {}

    async execute(email: string, password: string): Promise<{ token: string }> {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.repository.findByEmail(normalizedEmail);
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = signToken({ id: user.id, email: user.email });
        return { token };
    }
}
