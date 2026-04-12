import { IUserRepository } from '../../repositories/user/interfaces/IUserRepository';
import { CreateUserDTO, UserResponseDTO } from '../../domain/user.entity';
import { AppError } from '../../shared/errors/AppError';
import { hash } from '../../shared/utils/hash';

export class Register {
    constructor(private readonly repository: IUserRepository) {}

    async execute(data: CreateUserDTO): Promise<UserResponseDTO> {
        const email = data.email.trim().toLowerCase();

        const exists = await this.repository.findByEmail(email);
        if (exists) {
            throw new AppError('Email already in use', 409);
        }

        const password = await hash(data.password);
        const user = await this.repository.create({ ...data, email, password });

        const { password: _password, ...response } = user;
        return response;
    }
}
