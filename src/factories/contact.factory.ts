import { ContactRepository } from '../repositories/contact/contact.repository';
import { CreateContact } from '../use-cases/contact/create-contact';
import { ListContacts } from '../use-cases/contact/list-contacts';
import { GetContact } from '../use-cases/contact/get-contact';
import { UpdateContact } from '../use-cases/contact/update-contact';
import { DeleteContact } from '../use-cases/contact/delete-contact';
import { CreateContactController } from '../controllers/contact/create-contact.controller';
import { ListContactsController } from '../controllers/contact/list-contacts.controller';
import { GetContactController } from '../controllers/contact/get-contact.controller';
import { UpdateContactController } from '../controllers/contact/update-contact.controller';
import { DeleteContactController } from '../controllers/contact/delete-contact.controller';

export function makeContactControllers() {
    const repository = new ContactRepository();

    return {
        create: new CreateContactController(new CreateContact(repository)),
        list: new ListContactsController(new ListContacts(repository)),
        getById: new GetContactController(new GetContact(repository)),
        update: new UpdateContactController(new UpdateContact(repository)),
        delete: new DeleteContactController(new DeleteContact(repository)),
    };
}
