import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioEntity } from './entities/usuario.entity';
import { VerificacionEntity } from './entities/verificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity, VerificacionEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_PASS || 'clave_secreta', 
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}