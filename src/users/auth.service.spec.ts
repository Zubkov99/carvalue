import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  // сделали все поля UsersService опциональными
  let fakeUsersService: Partial<UsersService>;
  const users: Partial<User[]> = [];

  beforeEach(async () => {
    // создаем фейковую версию userService
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((item) => item.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const testPassword = 'myPassword';
    const testEmail = 'test@yandex.ru';
    const user = await service.signup(testEmail, testPassword);
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual(testPassword);
    expect(user.email).toEqual(testEmail);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    await service.signup('lolkek1@asdf.com', 'asdf');
    await expect(service.signup('lolkek1@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('laskdjf@alskdfj.com', '1234');
    await expect(
      service.signin('laskdjf@alskdfj.com', 'passowrd'),
    ).rejects.toThrow(BadRequestException);
  });

  it('return user if password is correct', async () => {
    await service.signup('asdf@asdf.com', 'laskdjf');
    const user = await service.signin('asdf@asdf.com', 'laskdjf');
    expect(user).toBeDefined();
  });
});
