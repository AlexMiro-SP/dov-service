import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello Dov!"', () => {
      expect(service.getHello()).toBe('Hello Dov!');
    });
  });

  describe('getVersion', () => {
    it('should return version information', () => {
      const version = service.getVersion();

      expect(version).toHaveProperty('version');
      expect(version).toHaveProperty('name');
      expect(version).toHaveProperty('description');
      expect(version).toHaveProperty('environment');
      expect(version).toHaveProperty('timestamp');

      expect(typeof version.version).toBe('string');
      expect(version.name).toBe('dov-service');
      expect(typeof version.description).toBe('string');
      expect(typeof version.environment).toBe('string');
      expect(typeof version.timestamp).toBe('string');
    });

    it('should return valid timestamp', () => {
      const version = service.getVersion();
      const timestamp = new Date(version.timestamp);

      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return development environment by default', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const version = service.getVersion();
      expect(version.environment).toBe('development');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const health = service.getHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');

      expect(health.status).toBe('ok');
      expect(typeof health.timestamp).toBe('string');
      expect(typeof health.uptime).toBe('number');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return valid timestamp', () => {
      const health = service.getHealth();
      const timestamp = new Date(health.timestamp);

      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return current process uptime', () => {
      const health = service.getHealth();
      const processUptime = process.uptime();

      // Allow small time difference due to execution time
      expect(health.uptime).toBeCloseTo(processUptime, 1);
    });
  });
});
