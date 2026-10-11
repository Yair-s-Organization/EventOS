import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbOptions,
      autoLoadEntities: true,
      synchronize: false, // el esquema se gestiona solo con migraciones
    }),
  ],
})
export class AppModule {}