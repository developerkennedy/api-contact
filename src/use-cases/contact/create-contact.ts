import {CreateContactDto} from "../../domain/contact.entity";
import {AppError} from "../../shared/errors/AppError";
import {IContactRepository} from "../../repositories/contact/interfaces/IContactRepository";

export class CreateContact {
    constructor(private readonly repository: IContactRepository) {}
    async execute(data: CreateContactDto) {
        const email = data.email.trim().toLowerCase();
        const existEmail = await this.repository.findByEmail(email, data.user_id);
        if (existEmail) {
            throw new AppError('A contact with this email already exists', 409)
        }
        return this.repository.create({...data, email});
    }
}