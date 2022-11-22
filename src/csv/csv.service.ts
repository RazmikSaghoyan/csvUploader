import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { parse } from '@fast-csv/parse';
import * as fs from 'fs';
import * as moment from 'moment';

import { Csv } from './csv.model';
import { ParseResponse } from '../utils/types';

@Injectable()
export class CsvService {

  constructor(
    @InjectRepository(Csv)
    private readonly csvRepository: Repository<Csv>,
  ) {
  }

  async groupBy(source = '', date = '') {
    const query = await this.csvRepository
        .createQueryBuilder('csv')
        .select([ 'source', 'SUM(csv.sum) as sum', 'date' ]);

    if (source) {
      query.where('source = :source', { source })
    }

    if (date) {
      query.andWhere('date >= :date', {date: moment(date, 'DD-MM-YYYY').toISOString()});
    }

    const data = await query.groupBy('source')
        .addGroupBy('date')
        .execute();

    return Object.entries(
        data.reduce((item, { source, date, sum }) => {
          if (!item[source]) {
            item[source] = [];
          }

          item[source].push({ date, sum });

          return item;
        }, {})
    ).map(([source, data]) => ({ source, data }));
  }

  async parseCsv(csvPath): Promise<ParseResponse>  {
    const data = [];

    await fs.createReadStream(csvPath)
        .pipe(parse({
          skipRows: 1
        }))
        .on('error', (error) => {
          return {
            success: false,
            message: error.message
          };
        })
        .on('data', (row) => {
          if (row.length) {
            data.push({
              date: moment(row[0], 'DD-MM-YYYY').toDate(),
              sum: row[1],
              source: row[2],
              description: row[3],
            } as Csv);
          }
        })
        .on('end', async (rowCount) => {
          if (rowCount) {
            return await getManager().transaction(async (entityManager) => {
              await entityManager.getRepository(Csv)
                  .createQueryBuilder()
                  .insert()
                  .values(data)
                  .execute();
            });
          }

          return {
            success: false,
            message: 'Empty file!'
          };
        });

    return {
      success: true,
      message: 'File uploaded successfully!'
    };
  }
}
