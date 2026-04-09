import {AppError} from "../../shared/errors/AppError";
import {IContactRepository} from "../../repositories/contact/interfaces/IContactRepository";

export class DeleteContact {
    constructor(private readonly repository: IContactRepository) {}
    async execute(id:string,user_id:string):Promise<void> {
        const contact = await this.repository.findById(id, user_id);
        if (!contact) {
           throw new AppError('Erro ao deletar contato',404)
       }
       return await this.repository.delete(id,user_id)
    }
}