import { Injectable, Inject } from '@nestjs/common';
import { WebhookDto } from '../dto/webhook.dto';
import { MensagemClienteService } from './mensagem-cliente.service';
import { RedisService } from './redis.service';
import { ApiService } from './api.service';
import { TimeService } from './time.service';
import { TemplateService } from './template.service';

@Injectable()
export class ChatbotService {
  constructor(
    @Inject('MensagemClienteService')
    private mensagemService: MensagemClienteService | any,
    @Inject('RedisService')
    private redisService: RedisService | any,
    @Inject('ApiService')
    private apiService: ApiService | any,
    private timeService: TimeService,
    private templateService: TemplateService,
  ) {}

  async processWebhook(webhookData: WebhookDto): Promise<void> {
    const { data } = webhookData.body;
    
    // Validação inicial - Se a mensagem não for válida para processamento
    if (!this.isValidMessage(data)) {
      return;
    }

    // Debounce - aguarda 3 segundos
    await this.delay(3000);

    // Armazenar mensagem no Redis
    await this.storeLastMessage(data.contactId, data.body);

    // Buscar última mensagem armazenada
    const lastStoredMessage = await this.getLastMessage(data.contactId);

    // Verificar se é a mesma mensagem (debounce)
    if (lastStoredMessage === data.body) {
      return;
    }

    // Analisar ticket do cliente
    const clientData = await this.mensagemService.findByContactId(data.contactId);
    
    if (!clientData) {
      // Primeiro contato - criar registro
      await this.mensagemService.createOrUpdate({
        contactid: data.contactId,
        ticketid: data.ticketId,
        lastmessage: data.updatedAt,
        state: 1
      });
      return;
    }

    // Verificar se o atendimento está fechado
    if (clientData.ticketid !== data.ticketId) {
      await this.handleClosedService(data, clientData);
      return;
    }

    // Verificar se está em atendimento pessoal
    if (clientData.ematendimento) {
      await this.handlePersonalService(data);
      return;
    }

    // Processar baseado no estado do cliente
    await this.processClientState(data, clientData);
  }

  private isValidMessage(data: any): boolean {
    const invalidTypes = ['hsm', 'transfer', 'ptt', 'sticker', 'vcard', 'location', 'impostor'];
    
    return !invalidTypes.includes(data.mediaType) &&
           !data.fromMe &&
           !data.ticket.contact.isGroup;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async storeLastMessage(contactId: number, message: string): Promise<void> {
    const key = `chatbot:last:user:${contactId}`;
    await this.redisService.set(key, message);
  }

  private async getLastMessage(contactId: number): Promise<string | null> {
    const key = `chatbot:last:user:${contactId}`;
    return await this.redisService.get(key);
  }

  private async handleClosedService(data: any, clientData: any): Promise<void> {
    // Comparar tempo da última mensagem
    if (clientData.lastmessage) {
      const timeComparison = this.timeService.compareTime(clientData.lastmessage);
      
      if (timeComparison.passedOneHour) {
        // Enviar template de desencontro
        const template = this.templateService.getReconnectionTemplate();
        await this.apiService.sendMessage(data.ticketId, template);
        
        // Reiniciar chatbot
        await this.mensagemService.restartChatbot(data.contactId, data.ticketId);
      }
    }
  }

  private async handlePersonalService(data: any): Promise<void> {
    // Recuperar ticket e atualizar última mensagem
    const ticket = await this.apiService.getTicket(data.ticketId);
    await this.mensagemService.updateLastMessage(data.contactId, ticket.updatedAt);
  }

  private async processClientState(data: any, clientData: any): Promise<void> {
    switch (clientData.state) {
      case 1:
        await this.handleState1(data);
        break;
      case 2:
        await this.handleState2(data);
        break;
      case 3:
        await this.handleState3(data);
        break;
      case 4:
        await this.handleState4(data);
        break;
      case 5:
        await this.handleState5(data);
        break;
      // Adicionar outros estados conforme necessário
      default:
        console.log(`State ${clientData.state} not implemented yet`);
    }
  }

  private async handleState1(data: any): Promise<void> {
    // Estado inicial - perguntar se tem projeto
    if (data.body === '1') {
      // Tem projeto
      const template = this.templateService.getProjectTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 4,
        fase_arquivos: 'projeto'
      });
    } else if (data.body === '2') {
      // Não tem projeto
      const template = this.templateService.getFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 5,
        fase_arquivos: 'plantabaixa'
      });
    }
  }

  private async handleState2(data: any): Promise<void> {
    // Implementar lógica do estado 2
    console.log('State 2 processing not implemented yet');
  }

  private async handleState3(data: any): Promise<void> {
    // Implementar lógica do estado 3
    console.log('State 3 processing not implemented yet');
  }

  private async handleState4(data: any): Promise<void> {
    // Estado: enviando arquivos do projeto
    if (data.mediaUrl || data.body === 'OK') {
      // Arquivo enviado ou confirmação OK
      if (data.body === 'OK') {
        // Finalizar processo de envio de arquivos
        await this.mensagemService.updateClient(data.contactId, {
          state: 6 // Próximo estado
        });
      }
    }
  }

  private async handleState5(data: any): Promise<void> {
    // Estado: pergunta sobre planta baixa
    if (data.body === '1') {
      // Tem medidas
      const template = this.templateService.getHasFloorPlanTemplate();
      await this.apiService.sendMessage(data.ticketId, template);
      
      await this.mensagemService.updateClient(data.contactId, {
        state: 4,
        fase_arquivos: 'plantabaixa'
      });
    } else if (data.body === '2') {
      // Não tem medidas
      await this.mensagemService.updateClient(data.contactId, {
        state: 7 // Estado para agendar medição
      });
    }
  }
}
