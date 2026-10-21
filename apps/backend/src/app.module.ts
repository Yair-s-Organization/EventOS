import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './database/data-source';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventosModule } from './modules/eventos/eventos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbOptions,
      autoLoadEntities: true,
      synchronize: false,
    }),
    StorageModule,
    AuthModule,
    EventosModule,
  ],
})
export class AppModule { }                       