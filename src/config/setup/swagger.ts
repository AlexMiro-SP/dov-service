import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('DOV Snippet API')
    .setDescription('API documentation for dynamic content snippet management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.paths = Object.fromEntries(
    Object.entries(document.paths).map(([path, methods]) => {
      const updated = Object.fromEntries(
        Object.entries(methods).map(([method, op]: [string, any]) => {
          const operation = op as { security?: any[] };
          if (!operation.security) operation.security = [{ 'access-token': [] }];
          return [method, operation];
        }),
      );
      return [path, updated];
    }),
  );

  SwaggerModule.setup('api/docs', app, document);
}
