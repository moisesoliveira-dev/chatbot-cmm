import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensagemCliente } from '../entities/mensagem-cliente.entity';
import { WebhookController } from '../controllers/webhook.controller';
import { ChatbotService } from '../services/chatbot.service';
import { MensagemClienteService } from '../services/mensagem-cliente.service';
import { RedisService } from '../services/redis.service';
import { ApiService } from '../services/api.service';
import { TimeService } from '../services/time.service';
import { TemplateService } from '../services/template.service';
import { GoogleDriveService } from '../services/google-drive.service';
import { FileStorageService } from '../services/file-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([MensagemCliente])],
  controllers: [WebhookController],
  providers: [
    ChatbotService,
    MensagemClienteService,
    RedisService,
    ApiService,
    GoogleDriveService,
    FileStorageService,
    TimeService,
    TemplateService,
  ],
  exports: [
    ChatbotService,
    MensagemClienteService,
    RedisService,
    ApiService,
    GoogleDriveService,
    FileStorageService,
    TimeService,
    TemplateService,
  ],
})
export class ChatbotModule {}
