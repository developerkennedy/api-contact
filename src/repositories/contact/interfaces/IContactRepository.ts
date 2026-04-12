import {
    ContactDTO,
    ContactWithCategories,
    CreateContactDto,
    UpdateContactDto,
} from '../../../domain/contact.entity';
import { PaginationParams, PaginationResult } from '../../../shared/types/pagination';

export interface IContactRepository {
    createWithCategories(values: CreateContactDto): Promise<ContactWithCategories>;
    findAll(
        user_id: string,
        pagination: PaginationParams
    ): Promise<PaginationResult<ContactWithCategories>>;
    findById(id: string, user_id: string): Promise<ContactWithCategories | null>;
    findByEmail(email: string, user_id: string): Promise<ContactDTO | null>;
    delete(id: string, user_id: string): Promise<void>;
    updateWithCategories(
        user_id: string,
        id: string,
        contact: UpdateContactDto
    ): Promise<ContactWithCategories | null>;
}
