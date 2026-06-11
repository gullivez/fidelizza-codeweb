import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello() {
    return {
      status: 'ok',
      env: this.configService.get('nodeEnv'),
      port: this.configService.get('port'),
    };
  }
  @Get('/health')
  getHealth() {
    return {
      status: 'online',
      message: 'Sem problemas por aqui',
    };
  }
  @Get('/db-test')
  async dbTest() {
    return this.databaseService.testConnection();
    } 
}