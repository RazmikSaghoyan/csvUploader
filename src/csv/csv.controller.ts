import {UseInterceptors, Controller, Get, Query, Res, HttpCode, Post, UploadedFile} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as moment from 'moment';

import { CsvService } from './csv.service';
import { csvFileFilter, csvFileName } from '../utils/helper';
import { ParseResponse } from '../utils/types';


@Controller('csv')
export class CsvController {

  constructor(private readonly csvService: CsvService) {}

  @Get('group')
  @HttpCode(200)
  async groupBy(@Query() params, @Res() res) {
    const { source = '', date = '' } = params;

    if (date && !moment(date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).send({
        message: 'Invalid date format'
      })
    }

    return res.status(200).send({
      data: await this.csvService.groupBy(source, date)
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/csv',
      filename: csvFileName,
    }),
    fileFilter: csvFileFilter,
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    const uploaded: ParseResponse = await this.csvService.parseCsv(join(__dirname, '..', '..', 'uploads/csv', 'data.csv'));

    return res.status(200).send({
      ...uploaded,
      data: {
        originalName: file.originalname,
        fileName: file.filename,
      }
    });
  }
}
