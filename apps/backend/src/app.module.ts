import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './database/data-source';

@Module({                                       
  imports: [
    TypeOrmModule.forRoot({                     
      ...dbOptions,                             
      autoLoadEntities: true,                   
      synchronize: false,                      
    }),
  ],
})
export class AppModule {}                       