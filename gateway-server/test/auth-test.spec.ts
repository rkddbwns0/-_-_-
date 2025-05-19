import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { UserDocument, Users, UserSchema } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';

describe('auth test', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_URI!),
        MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(Users.name),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userModel.deleteMany({
      $or: [{ email: 'testing1@naver.com' }, { email: null }],
    });
  });

  it('테스트용 유저 생성 후 로그인', async () => {
    const password = 'qwe123123';
    const hash = await bcrypt.hash(password, 10);

    const testModel = await userModel.create({
      user_id: 100,
      email: 'testing@naver.com',
      password: hash,
      name: 'test',
      role: 'user',
      code: 'test123123',
    });

    console.log(testModel.email);

    testModel.save();

    const loginRes = await request(app.getHttpServer())
      .post(`/gateway/auth/login`)
      .send({ email: 'testing@naver.com', password: password })
      .set('Accept', 'application/json');

    expect(loginRes.status).toBe(200);
    expect(typeof loginRes.body.accessToken).toBe('string');
    expect(typeof loginRes.body.refreshToken).toBe('string');
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body).toHaveProperty('refreshToken');
  });
});
