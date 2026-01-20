import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CrmModule } from '../crm/crm.module.js';

@Module({
  imports: [CrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}