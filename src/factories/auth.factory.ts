import { UserRepository } from "../repositories/user/user.repository";
import { Register } from "../use-cases/auth/register";
import { Login } from "../use-cases/auth/login";
import { RegisterController } from "../controllers/auth/register.controller";
import { LoginController } from "../controllers/auth/login.controller";

export function makeAuthControllers() {
    const repository = new UserRepository();

    return {
        register: new RegisterController(new Register(repository)),
        login: new LoginController(new Login(repository)),
    };
}
