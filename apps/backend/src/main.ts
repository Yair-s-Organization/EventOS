import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  // crea la aplicación a partir del módulo raíz
  app.setGlobalPrefix('api');                       // todas las rutas empiezan con /api
  await app.listen(process.env.PORT ?? 3000);       // escucha en el puerto del .env, o el 3000
}
bootstrap();                                        // arranca todo