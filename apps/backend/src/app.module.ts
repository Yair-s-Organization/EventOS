import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './database/data-source';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventosModule } from './modules/eventos/eventos.module';
import { RecintosModule } from './modules/recintos/recintos.module';
import { ReservationsModule } from './modules/reservas/reservations.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

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
    RecintosModule,
    ReservationsModule, 
    UsuariosModule,
  ],
})
export class AppModule {}                   