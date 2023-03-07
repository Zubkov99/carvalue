import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  const usersList = [
    { id: 1, email: 'someemail@yandex.ru', password: '12345' },
    { id: 2, email: 'someemail2@yandex.ru', password: '12345' },
  ];

  beforeEach(async () => {
    fakeAuthService = {
      // async signup(email: string, password: string): {},
      async signin(email: string, password: string): Promise<User> {
        return Promise.resolve({ email, password, id: 1 } as User);
      },
    };

    fakeUsersService = {
      find(email: string): Promise<User[]> {
        return Promise.resolve([{ id: 1, email, password: '12345' }]);
      },
      async findOne(id: number): Promise<User> {
        const user = usersList.find((item) => item.id === id);
        if (!user) {
          throw new NotFoundException('user not found');
        }
        return Promise.resolve(user);
      },
      // async remove(id: number): Promise<User> {}
      // async update(id: number, attrs: Partial<User>): Promise<User> {}
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers return array of users with the given email', async () => {
    const userEmail = 'testUserEmail@yandex.ru';
    const users = await controller.findAllUsers(userEmail);
    expect(users.length).toBeTruthy();
    expect(users[0].email).toEqual(userEmail);
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser(1);
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    await expect(controller.findUser(10)).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: Math.floor(Math.random() * 10) };
    const user = await controller.signin(
      { email: 'dima@yandex.ru', password: '1234' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
