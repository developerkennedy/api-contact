import { CategoryDTO, CreateCategoryDto, UpdateCategoryDto } from '../../../domain/category.entity';
import { PaginationParams, PaginationResult } from '../../../shared/types/pagination';

export interface ICategoryRepository {
    create(data: CreateCategoryDto): Promise<CategoryDTO>;
    findById(id: string, user_id: string): Promise<CategoryDTO | null>;
    findByName(name: string, user_id: string): Promise<CategoryDTO | null>;
    findAll(user_id: string, pagination: PaginationParams): Promise<PaginationResult<CategoryDTO>>;
    delete(id: string, user_id: string): Promise<void>;
    update(id: string, user_id: string, data: UpdateCategoryDto): Promise<CategoryDTO | null>;
}
