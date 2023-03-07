import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication system (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/signup (POST), signup a new user', () => {
    const testEmail = 'test3@yandex.ru';
    return supertest(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: '12345' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testEmail);
      });
  });

  it('signup a new user then get the currently logged in user', async () => {
    const testEmail = 'test4@yandex.ru';
    const res = await supertest(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: 'testpassword' })
      .expect(201);

    // получаем куки из ответа
    const cookie = res.get('Set-Cookie');

    const { body } = await supertest(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.id).toBeDefined();
    expect(body.email).toEqual(testEmail);
  });
});
