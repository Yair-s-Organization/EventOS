import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './data-source';

@Module({                                       // un módulo agrupa partes de la aplicación
  imports: [
    TypeOrmModule.forRoot({                     // conecta TypeORM con NestJS
      ...dbOptions,                             // usa los mismos datos de conexión
      autoLoadEntities: true,                   // registra solas las entidades declaradas con forFeature
      synchronize: false,                       // NO modifica tablas automáticamente (solo migraciones)
    }),
  ],
})
export class AppModule {}                       // la clase vacía existe para "recibir" el @Module