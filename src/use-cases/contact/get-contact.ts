import { IContactRepository } from '../../repositories/contact/interfaces/IContactRepository';
import { ContactDTO } from '../../domain/contact.entity';
import { AppError } from '../../shared/errors/AppError';

export class GetContact {
    constructor(private readonly repository: IContactRepository) {}
    async execute(id: string, user_id: string): Promise<ContactDTO> {
        const contact = await this.repository.findById(id, user_id);
        if (!contact) {
            throw new AppError('Contact not found', 404);
        }
        return contact;
    }
}
