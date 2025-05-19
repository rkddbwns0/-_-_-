// import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from 'src/app.module';

// describe('GatewayServer', () => {
//   let app: INestApplication;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/gateway/evnet (POST)', async () => {
//     const response = await require(app.getHttpServer())
//       .post('/gateway/event/createEvent')
//       .set('Authorization', `Bearer `)
//       .send({});
//   });
// });
