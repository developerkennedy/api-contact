import { UserRepository } from '../repositories/user/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token/refresh-token.repository';
import { Register } from '../use-cases/auth/register';
import { Login } from '../use-cases/auth/login';
import { RefreshToken } from '../use-cases/auth/refresh-token';
import { Logout } from '../use-cases/auth/logout';
import { RegisterController } from '../controllers/auth/register.controller';
import { LoginController } from '../controllers/auth/login.controller';
import { RefreshTokenController } from '../controllers/auth/refresh-token.controller';
import { LogoutController } from '../controllers/auth/logout.controller';

export function makeAuthControllers() {
    const userRepository = new UserRepository();
    const refreshTokenRepository = new RefreshTokenRepository();

    return {
        register: new RegisterController(new Register(userRepository)),
        login: new LoginController(new Login(userRepository, refreshTokenRepository)),
        refresh: new RefreshTokenController(new RefreshToken(refreshTokenRepository)),
        logout: new LogoutController(new Logout(refreshTokenRepository)),
    };
}
