import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { ChatbotService } from '../services/chatbot.service';
import { MockMensagemClienteService } from '../services/mock-mensagem-cliente.service';
import { MockRedisService } from '../services/mock-redis.service';
import { MockApiService } from '../services/mock-api.service';
import { MockGoogleDriveService } from '../services/mock-google-drive.service';
import { MockFileStorageService } from '../services/mock-file-storage.service';
import { TimeService } from '../services/time.service';
import { TemplateService } from '../services/template.service';

// Development module with mock services for testing without external dependencies
@Module({
  controllers: [WebhookController],
  providers: [
    ChatbotService,
    {
      provide: 'MensagemClienteService',
      useClass: MockMensagemClienteService,
    },
    {
      provide: 'RedisService',
      useClass: MockRedisService,
    },
    {
      provide: 'ApiService',
      useClass: MockApiService,
    },
    {
      provide: 'GoogleDriveService',
      useClass: MockGoogleDriveService,
    },
    {
      provide: 'FileStorageService',
      useClass: MockFileStorageService,
    },
    TimeService,
    TemplateService,
  ],
  exports: [
    ChatbotService,
    'MensagemClienteService',
    'RedisService',
    'ApiService',
    'GoogleDriveService',
    'FileStorageService',
    TimeService,
    TemplateService,
  ],
})
export class DevChatbotModule {}
