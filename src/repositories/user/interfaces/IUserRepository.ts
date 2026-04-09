import { CreateUserDTO, UserDTO } from "../../../domain/user.entity";

export interface IUserRepository {
    create(data: CreateUserDTO): Promise<UserDTO>;
    findByEmail(email: string): Promise<UserDTO | null>;
}
