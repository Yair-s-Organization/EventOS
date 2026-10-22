import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecintoEntity } from './entities/recinto.entity';
import { RecintoService } from './services/recinto.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecintoEntity])],
  providers: [RecintoService],
  exports: [RecintoService],
})
export class RecintosModule {}
