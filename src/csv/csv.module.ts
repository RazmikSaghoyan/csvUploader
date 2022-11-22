import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { Csv } from './csv.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Csv ]),
  ],
  providers: [ CsvService ],
  exports: [ CsvService ],
  controllers: [ CsvController ],
})
export class CsvModule {
}
