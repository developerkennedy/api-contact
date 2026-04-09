import {ContactDTO, CreateContactDto,UpdateContactDto} from "../../../domain/contact.entity";
import {PaginationParams, PaginationResult} from "../../../shared/types/pagination";

export interface IContactRepository {
    create(values: CreateContactDto): Promise<ContactDTO>,
    findAll(user_id:string,pagination: PaginationParams): Promise<PaginationResult<ContactDTO>>,
    findById(id: string, user_id: string): Promise<ContactDTO | null>,
    findByEmail(email: string, user_id: string): Promise<ContactDTO | null>,
    delete(id: string, user_id: string): Promise<void>,
    update(user_id :string, id: string, contact:UpdateContactDto ): Promise<ContactDTO | null>,
}