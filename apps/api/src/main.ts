import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');

  // Security & Compression
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());

  // Permissive CORS for development
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lorry Fleet Management ERP API')
    .setDescription(
      'Complete REST API for managing lorries, drivers, trips, fuel, expenses, billing and reports.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Fleet', 'Vehicle and document management')
    .addTag('Drivers', 'Driver profiles and assignments')
    .addTag('Trips', 'Trip lifecycle management')
    .addTag('Fuel', 'Fuel entries and efficiency')
    .addTag('Expenses', 'Expense tracking')
    .addTag('Maintenance', 'Servicing, repairs and tyres')
    .addTag('Customers', 'Customer profiles and balances')
    .addTag('Billing', 'Invoices and payments')
    .addTag('Reports', 'Analytics and reports')
    .addTag('Notifications', 'User notifications')
    .addTag('Users', 'User and role management')
    .addTag('Audit', 'Audit logs')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 API running at: http://localhost:${port}/${apiPrefix}`);
  logger.log(
    `📚 Swagger docs at: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

bootstrap();
