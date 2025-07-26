import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { envSchema } from './config/env.validation';
import { globalValidationPipe } from './config/setup/validation';
import { getGlobalGuards } from './config/setup/guards';
import { setupSwagger } from './config/setup/swagger';

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(globalValidationPipe);

  const reflector = app.get(Reflector);
  const [jwt, roles] = getGlobalGuards(reflector);
  app.useGlobalGuards(jwt, roles);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
