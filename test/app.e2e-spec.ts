import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Root endpoint', () => {
    it('/ (GET) should return Hello Dov', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Hello Dov!');
    });
  });

  describe('Version endpoint', () => {
    it('/version (GET) should return version information', () => {
      return request(app.getHttpServer())
        .get('/version')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('name');
          const body = res.body as {
            version: string;
            name: string;
            timestamp: string;
            description?: string;
            environment?: string;
          };
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('timestamp');
          expect(typeof body.version).toBe('string');
          expect(body.name).toBe('dov-service');
          expect(typeof body.timestamp).toBe('string');
        });
    });

    it('/version (GET) should return valid timestamp', () => {
      return request(app.getHttpServer())
        .get('/version')
        .expect(200)
        .expect(res => {
          const body = res.body as { timestamp: string };
          const timestamp = new Date(body.timestamp);
          expect(timestamp.getTime()).not.toBeNaN();
          expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        });
    });
  });

  describe('Health endpoint', () => {
    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          const body = res.body as { status: string; timestamp: string; uptime: number };
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(body.status).toBe('ok');
          expect(typeof body.uptime).toBe('number');
          expect(body.uptime).toBeGreaterThanOrEqual(0);
        });
    });

    it('/health (GET) should return valid timestamp', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(res => {
          const body = res.body as { timestamp: string };
          const timestamp = new Date(body.timestamp);
          expect(timestamp.getTime()).not.toBeNaN();
          expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        });
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer()).get('/non-existent-route').expect(404);
    });
  });
});
