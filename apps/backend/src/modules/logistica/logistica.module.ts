import { Module } from '@nestjs/common';
import { LogisticaService } from './logistica.service';

@Module({
  providers: [LogisticaService],
  exports: [LogisticaService],
})
export class LogisticaModule {}