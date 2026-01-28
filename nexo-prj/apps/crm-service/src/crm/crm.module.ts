import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
import { AttachmentsController } from './attachments.controller.js';
import { AttachmentsService } from './attachments.service.js';

@Module({
  controllers: [CrmController, AttachmentsController],
  providers: [CrmService, AttachmentsService],
  exports: [CrmService, AttachmentsService],
})
export class CrmModule {}