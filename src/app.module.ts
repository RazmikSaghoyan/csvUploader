import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvModule } from './csv/csv.module';
import { Csv } from './csv/csv.model';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || '',
      username: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      entities: [ Csv ],
      synchronize: !!process.env.DB_SYNCHRONIZE || false,
    }),
    CsvModule,
  ],
})
export class AppModule {
}
