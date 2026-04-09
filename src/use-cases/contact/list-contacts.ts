import {IContactRepository} from "../../repositories/contact/interfaces/IContactRepository";
import {ContactDTO} from "../../domain/contact.entity";
import {PaginationParams, PaginationResult} from "../../shared/types/pagination";


export class ListContacts {
    constructor(private readonly repository: IContactRepository){}
    async execute(user_id:string,{limit,offset}:PaginationParams): Promise<PaginationResult<ContactDTO>> {
      return  await this.repository.findAll(user_id,{limit,offset});
    }
}