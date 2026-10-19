import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './database/data-source';
import { StorageModule } from './common/storage/storage.module';

@Module({                                       
  imports: [
    TypeOrmModule.forRoot({                     
      ...dbOptions,                             
      autoLoadEntities: true,                   
      synchronize: false,                      
    }),
    StorageModule,
  ],
})
export class AppModule {}                       