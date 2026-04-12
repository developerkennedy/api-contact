import { CreateRefreshTokenDTO, RefreshTokenDTO } from '../../../domain/refresh-token.entity';

export interface IRefreshTokenRepository {
    create(data: CreateRefreshTokenDTO): Promise<RefreshTokenDTO>;
    findByHash(tokenHash: string): Promise<RefreshTokenDTO | null>;
    deleteById(id: string): Promise<void>;
    deleteByFamilyId(familyId: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    deleteExpired(): Promise<void>;
    rotate(oldId: string, newToken: CreateRefreshTokenDTO): Promise<RefreshTokenDTO>;
}
