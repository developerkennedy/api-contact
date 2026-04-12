import { IUserRepository } from '../../repositories/user/interfaces/IUserRepository';
import { AppError } from '../../shared/errors/AppError';
import { comparePassword } from '../../shared/utils/hash';
import { signToken } from '../../auth/jwt';

const DUMMY_HASH = '$2a$12$000000000000000000000uGBOBKFmlOTfMCaqGFS1RhSLgIVGeLy';

export class Login {
    constructor(private readonly repository: IUserRepository) {}

    async execute(email: string, password: string): Promise<{ token: string }> {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.repository.findByEmail(normalizedEmail);

        const hashToCompare = user ? user.password : DUMMY_HASH;
        const valid = await comparePassword(password, hashToCompare);

        if (!user || !valid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = signToken({ id: user.id });
        return { token };
    }
}
