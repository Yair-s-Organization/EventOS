import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecintoEntity } from './entities/recinto.entity';
import { SubEventoEntity } from '../eventos/entities/subevento.entity';
import { RecintoService } from './services/recinto.service';
import { EspaciosController } from './controllers/espacios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RecintoEntity, SubEventoEntity])],
  controllers: [EspaciosController],
  providers: [RecintoService],
  exports: [RecintoService],
})
export class RecintosModule {}
