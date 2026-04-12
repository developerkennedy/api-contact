import { IRefreshTokenRepository } from './interfaces/IRefreshTokenRepository';
import { CreateRefreshTokenDTO, RefreshTokenDTO } from '../../domain/refresh-token.entity';
import { db } from '../../config/db';
import { refreshTokensTable } from '../../domain/contact.schema';
import { eq, lt } from 'drizzle-orm';

export class RefreshTokenRepository implements IRefreshTokenRepository {
    async create(data: CreateRefreshTokenDTO): Promise<RefreshTokenDTO> {
        const [token] = await db.insert(refreshTokensTable).values(data).returning();
        return token;
    }

    async findByHash(tokenHash: string): Promise<RefreshTokenDTO | null> {
        const token = await db.query.refreshTokensTable.findFirst({
            where: eq(refreshTokensTable.token_hash, tokenHash),
        });
        return token ?? null;
    }

    async deleteById(id: string): Promise<void> {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, id));
    }

    async deleteByFamilyId(familyId: string): Promise<void> {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.family_id, familyId));
    }

    async deleteByUserId(userId: string): Promise<void> {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.user_id, userId));
    }

    async deleteExpired(): Promise<void> {
        await db.delete(refreshTokensTable).where(lt(refreshTokensTable.expires_at, new Date()));
    }

    async rotate(oldId: string, newToken: CreateRefreshTokenDTO): Promise<RefreshTokenDTO> {
        return db.transaction(async (tx) => {
            await tx
                .update(refreshTokensTable)
                .set({ is_rotated: true })
                .where(eq(refreshTokensTable.id, oldId));

            const [created] = await tx.insert(refreshTokensTable).values(newToken).returning();

            return created;
        });
    }
}
