import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookDto } from '../dto/webhook.dto';
import { ChatbotService } from '../services/chatbot.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('gosac')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: WebhookDto): Promise<{ success: boolean }> {
    try {
      await this.chatbotService.processWebhook(webhookData);
      return { success: true };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
}
