/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  async healthCheck() {
    return await this.appService.healthCheck();
  }

  @Post('/drop')
  async dropTable(@Body('tableName') tableName: string) {
    if (!tableName) {
      // throw new HttpException(
      //   'No table name provided. Please include tableName in the request body.',
      //   HttpStatus.BAD_REQUEST
      // );
      return await this.appService.dropAllTables();
    }
    return await this.appService.dropTable(tableName);
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          Logger.log('Unique name:', uniqueName)
          callback(null, uniqueName);
        },
      }),
    })
  )
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded.', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.uploadCSV(file.path);
  }

  @Post('/query')
  async queryData(@Body('naturalLanguageQuery') naturalLanguageQuery: string) {
    if (!naturalLanguageQuery) {
      throw new HttpException('No query provided.', HttpStatus.BAD_REQUEST);
    }
    Logger.log("NLP", naturalLanguageQuery)
    return await this.appService.queryData(naturalLanguageQuery);
  }
}
