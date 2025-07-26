import { Injectable } from '@nestjs/common';
import * as packageJson from '../package.json';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Dov!';
  }

  getVersion() {
    return {
      version: packageJson.version,
      name: packageJson.name,
      description: packageJson.description || 'DOV Backend Service',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
