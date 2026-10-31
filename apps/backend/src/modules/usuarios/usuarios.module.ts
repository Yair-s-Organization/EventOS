import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuariosService } from './services/usuarios.service';
import { UsuarioEntity } from '../auth/entities/usuario.entity';
import { VerificacionEntity } from '../auth/entities/verificacion.entity';
import { RolEntity } from './entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity, VerificacionEntity, RolEntity]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}