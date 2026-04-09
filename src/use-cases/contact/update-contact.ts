import {UpdateContactDto} from "../../domain/contact.entity";
import {AppError} from "../../shared/errors/AppError";
import {IContactRepository} from "../../repositories/contact/interfaces/IContactRepository";

export class UpdateContact {
    constructor(private readonly repository: IContactRepository) {}

    async execute(id: string, user_id: string, data: UpdateContactDto) {
        const contact = await this.repository.findById(id, user_id);
        if (!contact) {
            throw new AppError('Contact not found', 404);
        }

        if (data.email) {
            const email = data.email.trim().toLowerCase();
            const existEmail = await this.repository.findByEmail(email, user_id);
            if (existEmail && existEmail.id !== id) {
                throw new AppError('A contact with this email already exists', 409);
            }
            data = { ...data, email };
        }

        return this.repository.update(user_id, id, data);
    }
}
