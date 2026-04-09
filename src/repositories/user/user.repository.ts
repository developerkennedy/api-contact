import { IUserRepository } from "./interfaces/IUserRepository";
import { CreateUserDTO, UserDTO } from "../../domain/user.entity";
import { db } from "../../config/db";
import { usersTable } from "../../domain/contact.schema";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
    async create(data: CreateUserDTO): Promise<UserDTO> {
        const [user] = await db.insert(usersTable).values(data).returning();
        return user;
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email),
        });
        return user ?? null;
    }
}
