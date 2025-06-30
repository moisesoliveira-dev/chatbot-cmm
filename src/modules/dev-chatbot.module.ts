import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { ChatbotService } from '../services/chatbot.service';
import { MockMensagemClienteService } from '../services/mock-mensagem-cliente.service';
import { MockRedisService } from '../services/mock-redis.service';
import { MockApiService } from '../services/mock-api.service';
import { TimeService } from '../services/time.service';
import { TemplateService } from '../services/template.service';

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
    TimeService,
    TemplateService,
  ],
  exports: [
    ChatbotService,
    'MensagemClienteService',
    'RedisService',
    'ApiService',
    TimeService,
    TemplateService,
  ],
})
export class DevChatbotModule {}
