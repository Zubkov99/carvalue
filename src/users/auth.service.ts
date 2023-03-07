import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_script);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    console.log('Log on lvl signup');
    // проверяем, что email используется
    const user = await this.usersService.find(email);
    if (user.length) throw new BadRequestException('email in use');

    // Хэшируем пароль юзера
    //генерируем соль
    const salt = randomBytes(8).toString('hex');
    // хэшируем вместе соль и пароль
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // объединяем хэш и соль
    const result = salt + '.' + hash.toString('hex');
    // создаем и сохраняем нового юзера
    return await this.usersService.create(email, result);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) throw new NotFoundException('user not found');

    // достаем хэш пароля из бд и делим на соль и storedHash
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // сравниваем хэш присланного пароля с хэшом из бд
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
