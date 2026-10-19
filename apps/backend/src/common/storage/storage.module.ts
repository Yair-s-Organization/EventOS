import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Global() // disponible en toda la app sin tener que importarlo en cada módulo
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

