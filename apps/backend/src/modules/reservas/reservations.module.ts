import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QrService } from './services/qr.service';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationsService } from './services/reservations.service';

@Module({
    imports: [
    JwtModule.register({
     secret: process.env.JWT_PASS, 
    }),
  ],
  controllers: [ReservationsController],
  providers: [QrService, ReservationsService],
})
export class ReservationsModule {}