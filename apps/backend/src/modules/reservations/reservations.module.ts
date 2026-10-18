import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QrService } from './services/qr.service';

@Module({
    imports: [
    JwtModule.register({
     secret: process.env.JWT_PASS, 
    }),
  ],
  controllers: [],
  providers: [QrService],
})
export class ReservationsModule {}